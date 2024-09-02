import { Memoize, MemoizeCacheType, addDate, arrayDistinct, castPercent, dateToIsoStr, extractIsoDateParts, isValidDate, normalizeTimezone, parseDate, parseHeaderMatrix, parseMoment, promiseRetry } from '@/@utils';
import { DataSource } from '@/core/enums/DataSource';
import { AssetHistData } from '@/core/models/AssetHistData';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { ConfigService } from '@/core/services/config.service';
import { BaseAssetService, GetDataParams } from '@/core/services/BaseAssetService';
import { HttpService } from '@/core/services/http.service';
import { GovBondDayTransparenteDto } from '@/gov-bond/dtos/GovBondDayTransparenteDto';
import { GovBondData, GovBondType } from '@/gov-bond/models/GovBondData';
import { Injectable, Scope } from '@nestjs/common';
import { sortBy } from 'lodash';
import * as xlsx from 'xlsx';

// Daily data from 2004-31-12 to ~D-1

@Injectable({ scope: Scope.DEFAULT })
export class GovBondDayTransparenteService extends BaseAssetService {
    private csvUrl = 'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv';

    private static cacheKey = () => dateToIsoStr(addDate(normalizeTimezone(new Date()), 0, -ConfigService.config.cacheTime));

    constructor() {
        super(DataSource.GovBondDayTransparente);
    }

    // NTN-B/2040
    async getData(params: GetDataParams): Promise<AssetHistData<GovBondData>> {
        this.validateParams(params, ['minDate','maxDate']);

        const assetData: AssetHistData<GovBondData> = {
            key: params.assetCode ?? AssetType.GovBond,
            type: AssetType.GovBond,
            granularity: DataGranularity.Day,
            metadata: {
                errors: [],
                minDate: params.minDate,
                maxDate: params.maxDate,
            },
            data: [],
        };

        const dto = await this.getDto();

        assetData.data = dto.assetData;
        assetData.metadata = dto.metadata;

        assetData.data = assetData.data.filter(e => e.date >= params.minDate);
        assetData.data = assetData.data.filter(e => params.maxDate >= e.date);

        assetData.data = params.assetCode != null ? assetData.data.filter(e => e.assetCode === params.assetCode) : assetData.data;
        assetData.data = sortBy(assetData.data, e => e.date);

        return assetData;
    }

    @Memoize({
        cacheType: MemoizeCacheType.Storage,
        itemKey: (config, args, cache) => GovBondDayTransparenteService.cacheKey(),
        onCall: (config, args, cache) => cache.invalidate(e => e !== GovBondDayTransparenteService.cacheKey())
    })
    async getDto(): Promise<{ assetData: GovBondData[], metadata: any }> {
        this.logger.log(`--- Fetching data for ${GovBondDayTransparenteService.cacheKey()} ---`);

        const file = await promiseRetry(
            () => HttpService.get(this.csvUrl, { responseType: 'arraybuffer' }).then(r => Buffer.from(r.data, 'binary')),
            3,
            err => this.logger.warn(`Retry Error: ${err}`)
        );

        this.logger.log(`CSV Downloaded!`);

        const assetDto: GovBondDayTransparenteDto = {};
        // assetsDto.file = file;
        assetDto.workBook = xlsx.read(file, { type: 'buffer', raw: true }); // cellDates: false
        assetDto.workSheets = Object.entries(assetDto.workBook.Sheets);
        const workSheet = assetDto.workSheets[0][1];

        for (let cellId of Object.keys(workSheet)) { // https://www.npmjs.com/package/xlsx -> Cell Object
            if (cellId === '!ref') continue;

            const [_, colId, rowId] = cellId.match(/([A-Za-z]+)(\d+)/);
            const cell = workSheet[cellId];

            if (rowId === '1') continue;

            // Data Vencimento || Data Base
            if (colId === 'B' || colId === 'C')
                cell.v = parseDate(cell.v, 'DD/MM/YYYY');

            // Taxa Compra Manha || Taxa Venda Manha || PU Compra Manha || PU Venda Manha || PU Base Manha
            if (colId === 'D' || colId === 'E' || colId === 'F' || colId === 'G' || colId === 'H')
                cell.v = +cell.v.replace(',', '.');

            // if (workSheet[cell].t === 'n' && workSheet[cell].w) // Override 'XXX' with formated 'X,XX'
            //     workSheet[cell].v = +workSheet[cell].w.replace(',', '.');

            // if (workSheet[cell].t === 'd' && workSheet[cell].w) { // Normalize date as formated string 'DD/MM/YYYY'
            //     workSheet[cell].v = dateToStr(workSheet[cell].v);
            //     workSheet[cell].t = 's';
            // }
        }

        assetDto.rawJson = xlsx.utils.sheet_to_json(workSheet).map((e: any) => Object.values(e));

        // Map

        const header = ['assetType','maturityDate','date','buyRate','sellRate','buyPu','sellPu','basePu'];
        let assetData = parseHeaderMatrix<GovBondData>(header, assetDto.rawJson!);
        let metadata = { assetTypes: [], errors: [] };

        metadata.assetTypes = arrayDistinct(assetData.map(e => e.assetType));

        const assetTypeMap: Record<GovBondType, string[]> = {
            'LFT': ['Tesouro Selic'], // Selic
            'LTN': ['Tesouro Prefixado'], // Pre
            'NTN-F': ['Tesouro Prefixado com Juros Semestrais'], // Pre Juros
            'NTN-B-P': ['Tesouro IPCA+'], // IPCA
            'NTN-B': ['Tesouro IPCA+ com Juros Semestrais'], // IPCA Juros
            'NTN-C': ['Tesouro IGPM+ com Juros Semestrais'], // IGP-M
            'NTN-R': ['Tesouro Renda+ Aposentadoria Extra'], // Renda+
            'NTN-E': ['Tesouro Educa+'], // Educa+
        };

        for (let i = 0; i < assetData.length; i++) {
            const data = assetData[i];

            // Validate

            const isValid = isValidDate(data.date) && isValidDate(data.maturityDate)
                && data.buyRate != null && !isNaN(data.buyRate)
                && data.sellRate != null && !isNaN(data.sellRate)
                && data.buyPu != null && !isNaN(data.buyPu)
                && data.sellPu != null && !isNaN(data.sellPu);

            if (!isValid) {
                metadata.errors.push({
                    date: data.date,
                    message: 'Invalid Data',
                    data: JSON.stringify(data)
                });
                continue;
            }

            // Map

            const mappedType = Object.entries(assetTypeMap).find(gk => gk[1].some(k => k === data.assetType))?.[0] as GovBondType;

            if (!mappedType) {
                metadata.errors.push({
                    date: data.date,
                    message: 'GovBond type not found',
                    data: JSON.stringify(data),
                });
                continue;
            }

            data.assetType = mappedType;

            const year = extractIsoDateParts(data.maturityDate)[0];
            data.assetCode = `${mappedType}/${year}`;

            data.buyRate = castPercent(data.buyRate);
            data.sellRate = castPercent(data.sellRate);

            const date = parseMoment(data.date);
            data.date = date.toDate();
            data.maturityDate = new Date(data.maturityDate);

            data.value = data.buyPu;
            data.currency = 'BRL';
        }

        return { assetData, metadata };
    }
}
