import { arrayDistinct, extractIsoDateParts, isValidDate, parseHeaderMatrix, parseMoment, prependZeros, promiseParallel, promiseRetry } from '@/@utils';
import { DataSource } from '@/core/enums/DataSource';
import { AssetHistData } from '@/core/models/AssetHistData';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { BaseAssetService, GetDataParams } from '@/core/services/BaseAssetService';
import { HttpService } from '@/core/services/http.service';
import { GovBondDaySiswebDto } from '@/gov-bond/dtos/GovBondDaySiswebDto';
import { GovBondDaySiswebMetadata } from '@/gov-bond/dtos/GovBondDaySiswebMetadata';
import { GovBondData, GovBondType } from '@/gov-bond/models/GovBondData';
import { Injectable, Scope } from '@nestjs/common';
import { sortBy } from 'lodash';
import * as xlsx from 'xlsx';

// Daily data from 2002 to 2023

// Deprecated?
@Injectable({ scope: Scope.DEFAULT })
export class GovBondDaySiswebService extends BaseAssetService {
    private indexUrl = 'https://sisweb.tesouro.gov.br/apex/f?p=2031:2';
    private csvUrl = 'https://sisweb.tesouro.gov.br/apex/';

    constructor() {
        super(DataSource.GovBondDaySysweb);
    }

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

        const dto = await this.getDto(params.minDate?.getFullYear());

        // Map

        assetData.metadata.assetTypes = dto.reduce<string[]>((acc, val) => [ ...acc, ...Object.keys(val.rawJson as any)], []);
        assetData.metadata.assetTypes = arrayDistinct(assetData.metadata.assetTypes);

        const assetTypeMap: Record<GovBondType, string[]> = {
            'LFT': ['LFT'], // Selic
            'LTN': ['LTN'], // Pre
            'NTN-F': ['NTN-F', 'NTNF'], // Pre Juros
            'NTN-B-P': ['NTN-B-Principal', 'NTN-B-Princ', 'NTNBP'], // IPCA
            'NTN-B': ['NTN-B', 'NTNB'], // IPCA Juros
            'NTN-C': ['NTN-C', 'NTNC'], // IGP-M
            'NTN-R': [], // Renda+
            'NTN-E': [], // Educa+
        };

        for (let raw of dto) {
            for (const assetName in raw.rawJson) {
                // NTN-B Principal 150824 -> NTN-B Principal / 150824
                const codeSplit = assetName.split(' ');
                const maturity = codeSplit.splice(-1, 1)[0];
                const assetType = codeSplit.join('-');

                const rawData = raw.rawJson[assetName];

                const header = ['date','buyRate','sellRate','buyPU','sellPU','basePU'];
                const matrixData = parseHeaderMatrix<GovBondData>(header, rawData.slice(1));

                // Validate

                let validData = matrixData.filter(e => isValidDate(e.date) && e.buyRate != null && !isNaN(e.buyRate)
                    && e.sellRate != null && !isNaN(e.sellRate) && e.buyPu != null && !isNaN(e.buyPu) && e.sellPu != null && !isNaN(e.sellPu));

                const invalidData = matrixData.filter(e => !validData.some(f => f === e));
                const invalidDataErrors = invalidData.map(e => ({
                    date: e.date,
                    message: 'Missing Data',
                    data: JSON.stringify(e)
                }));
                assetData.metadata.errors.push(...invalidDataErrors);

                // Cast

                for (let data of validData) {
                    const mappedType = Object.entries(assetTypeMap).find(gk => gk[1].some(k => k === assetType))?.[0] as GovBondType;

                    if (!mappedType) {
                        assetData.metadata.errors.push({
                            date: data.date,
                            message: 'Asset type not found in assetTypeMap',
                            data: JSON.stringify(data)
                        });
                        continue;
                    }

                    data.assetType = mappedType;

                    const date = parseMoment(data.date, 'DD/MM/YYYY');
                    data.date = date.toDate();

                    const matParts = maturity.match(/.{1,2}/g) as string[];
                    data.maturityDate = new Date(`20${matParts[2]}-${prependZeros(matParts[1])}-${prependZeros(matParts[0])}T00:00:00-03:00`);

                    data.assetCode = `${assetType}:${extractIsoDateParts(data.maturityDate)[0]}`;
                    data.value = data.buyPu;
                }

                validData = validData.sort((a, b) => a.date > b.date ? -1 : b.date > a.date ? 1 : 0);

                validData = validData.filter(e => e.date >= params.minDate);
                validData = validData.filter(e => params.maxDate >= e.date);

                assetData.data = assetData.data.concat(validData);
            }
        }

        assetData.data = sortBy(assetData.data, e => e.date);

        return assetData;
    }

    // @Memoize({ cacheType: MemoizeCacheType.Storage })
    async getDto(minYear?: number): Promise<GovBondDaySiswebDto[]> {
        const assetsData: GovBondDaySiswebDto[] = [];

        let assetsMetadata = await this.getMetadata();

        if (minYear)
            assetsMetadata = assetsMetadata.filter(e => !e.year || +e.year >= minYear);

        const flatMetadata = assetsMetadata.flatMap(e => e.assets!.map(f => ({ group: e, asset: f })));

        await promiseParallel<void>(flatMetadata.map(e => () =>
            new Promise<void>(async (res, rej) => {
                try {
                    const file = await promiseRetry(
                        () => HttpService.get(e.asset.url!, { responseType: 'arraybuffer' }).then(r => Buffer.from(r.data, 'binary')),
                        3,
                        err => this.logger.warn(`Retry Error: ${err}`)
                    );

                    assetsData.push({
                        year: e.group.year,
                        code: e.asset.code,
                        url: e.asset.url,
                        file: file
                    });

                    res();
                } catch (err) {
                    this.logger.log('Error while downloading file: ' + e.asset.url);
                    rej(err);
                }
            })
        ), 1);

        for (let asset of assetsData) {
            asset.workBook = xlsx.read(asset.file, { type: 'buffer', cellDates: true });
            asset.workSheets = Object.entries(asset.workBook.Sheets);
            asset.rawJson =  asset.workSheets.reduce((acc, val) => ({
                ...acc,
                [val[0]]: xlsx.utils.sheet_to_json(val[1]).map((e: any) => Object.values(e))
            }), {});
        }

        return assetsData;
    }

    async getMetadata(): Promise<GovBondDaySiswebMetadata[]> {
        let html: string;

        const cookie = await promiseRetry(() =>
            HttpService.get(this.indexUrl, {
                maxRedirects: 0,
                validateStatus: status => status >= 200 && status < 303,
            }).then(r => r.headers["set-cookie"]),
            3,
            err => this.logger.warn(`Retry Error: ${err}`)
        );

        html = await promiseRetry(
            () => HttpService.get(this.indexUrl, { headers: { 'Cookie': cookie[0] } }).then(r => r.data),
            3,
            err => this.logger.warn(`Retry Error: ${err}`)
        );
        
        const htmlMain = html.match(/<div class="bl-body">[\s\S]*?<\/div>/)?.[0];
        if (!htmlMain) throw new Error('class="bl-body" not found');

        const htmlGroups = htmlMain?.match(/<span>[\s\S]*?(<br>|<\/div>)/g);
        if (!htmlGroups) throw new Error('class="bl-body" > span not found');

        const assetsMetadata: GovBondDaySiswebMetadata[] = htmlGroups.map(e => ({
            year: e.match(/<span>(\d+).*<\/span>/)?.[1], // 2020
            assets: e.match(/<a.*<\/a>/g)?.map(a => ({
                code: a.match(/download>(.*)<\/a>/)?.[1], // LFT
                url: this.csvUrl + a.match(/href="(.*)"/)?.[1], // https://sisweb.tesouro.gov.br/apex/cosis/sistd/obtem_arquivo/444:79907
            }))
        }));

        return assetsMetadata;
    }
}
