import { castPercent, extractIsoDateParts, isValidDate, parseDate, parseMoment, promiseRetry } from '@/@utils';
import { DataSource } from '@/core/enums/DataSource';
import { AssetHistData } from '@/core/models/AssetHistData';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { BaseAssetService, GetDataParams } from '@/core/services/BaseAssetService';
import { HttpService } from '@/core/services/http.service';
import { GovBondDayLastTdDto } from '@/gov-bond/dtos/GovBondDayLastTdDto';
import { GovBondData, GovBondType } from '@/gov-bond/models/GovBondData';
import { Injectable, Scope } from '@nestjs/common';
import * as https from 'https';
import { sortBy } from 'lodash';

// Daily data from D0

@Injectable({ scope: Scope.DEFAULT })
export class GovBondDayLastTdService extends BaseAssetService {
    private jsonUrl = 'https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json';

    constructor() {
        super(DataSource.GovBondDayLastTd);
    }

    async getData(params: GetDataParams): Promise<AssetHistData<GovBondData>> {
        // this.validateParams(params, ['assetCode']);

        const assetData: AssetHistData<GovBondData> = {
            key: params.assetCode ?? AssetType.GovBond,
            type: AssetType.GovBond,
            granularity: DataGranularity.Day,
            metadata: { errors: [] },
            data: [],
        };

        const dto = await this.getDto();

        // Map

        assetData.metadata.assetTypes = dto.response.TrsrBdTradgList.map(e => e.TrsrBd.nm);

        const assetTypeMap: Record<GovBondType, RegExp[]> = {
            'LFT': [/^Tesouro Selic/], // Selic
            'LTN': [/^Tesouro Prefixado \d+$/], // Pre
            'NTN-F': [/^Tesouro Prefixado com Juros Semestrais \d+$/], // Pre Juros
            'NTN-B-P': [/^Tesouro IPCA\+ \d+$/], // IPCA
            'NTN-B': [/^Tesouro IPCA\+ com Juros Semestrais \d+$/], // IPCA Juros
            'NTN-C': [/^Tesouro IGPM\+ com Juros Semestrais \d+$/], // IGP-M
            'NTN-R': [/^Tesouro Renda\+ Aposentadoria Extra \d+$/], // Renda+
            'NTN-E': [/^Tesouro Educa\+ \d+$/], // Educa+
        };

        const bondsDto = dto.response.TrsrBdTradgList.map(e => e.TrsrBd);
        const dateMoment = dto.response.TrsrBondMkt.qtnDtTm ? parseMoment(dto.response.TrsrBondMkt.qtnDtTm + '-03:00') : undefined;
        const date = dateMoment.toDate();

        for (let data of bondsDto) {
            // Validate

            const isValid = isValidDate(date) && isValidDate(data.mtrtyDt)
                && data.anulInvstmtRate != null && !isNaN(data.anulInvstmtRate)
                && data.anulRedRate != null && !isNaN(data.anulRedRate)
                && data.untrInvstmtVal != null && !isNaN(data.untrInvstmtVal)
                && data.untrRedVal != null && !isNaN(data.untrRedVal);

            if (!isValid) {
                assetData.metadata.errors.push({
                    date: date,
                    message: 'Invalid Data',
                    data: JSON.stringify(data)
                });
                continue;
            }

            // Map

            const mappedType = Object.entries(assetTypeMap).find(gk => gk[1].some(k => k.test(data.nm)))?.[0] as GovBondType;

            if (!mappedType) {
                assetData.metadata.errors.push({
                    date: date,
                    message: 'Asset type not found in assetTypeMap',
                    data: JSON.stringify(data)
                });
                continue;
            }

            const maturityDate = parseDate(data.mtrtyDt + '-03:00');

            const assetCode = `${mappedType}:${extractIsoDateParts(maturityDate)[0]}`;

            assetData.data.push({
                assetCode: assetCode,
                date: date,
                value: data.untrInvstmtVal,
                currency: 'BRL',
                assetType: mappedType,
                maturityDate: maturityDate,
                buyRate: castPercent(data.anulInvstmtRate),
                sellRate: castPercent(data.anulRedRate),
                buyPu: data.untrInvstmtVal,
                sellPu: data.untrRedVal,
                basePu: undefined,
            });
        }

        assetData.data = params.assetCode != null ? assetData.data.filter(e => e.assetCode === params.assetCode) : assetData.data;
        assetData.data = sortBy(assetData.data, e => e.date);

        return assetData;
    }

    // @Memoize({ cacheType: MemoizeCacheType.Storage })
    async getDto(): Promise<GovBondDayLastTdDto> {
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });

        const data = await promiseRetry(() =>
            HttpService.get<GovBondDayLastTdDto>(this.jsonUrl, { httpsAgent }).then(r => r.data),
            3,
            err => this.logger.warn(`Retry Error: ${err}`)
        );

        return data;
    }
}
