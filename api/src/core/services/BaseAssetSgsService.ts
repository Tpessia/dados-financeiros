import { castPercent, parseMoment, promiseRetry } from '@/@utils';
import { DataSource } from '@/core/enums/DataSource';
import { AssetData } from '@/core/models/AssetData';
import { AssetHistData } from '@/core/models/AssetHistData';
import { AssetSgsDto } from '@/core/models/AssetSgsDto';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { BaseAssetService, GetDataParams } from '@/core/services/BaseAssetService';
import { HttpService } from '@/core/services/http.service';
import { sortBy } from 'lodash';

export abstract class BaseAssetSgsService<T extends AssetData> extends BaseAssetService {
    protected assetType: AssetType;
    protected granularity: DataGranularity;
    protected jsonUrl: string;

    constructor(type: DataSource, assetType: AssetType, granularity: DataGranularity, code: string) {
        super(type);
        this.assetType = assetType;
        this.granularity = granularity;
        this.jsonUrl = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json`;
    }

    async getData({ assetCode, minDate, maxDate }: GetDataParams): Promise<AssetHistData<T>> {
        if (minDate == null || maxDate == null) throw new Error('Invalid params: minDate, maxDate');

        const assetData: AssetHistData<T> = {
            key: assetCode ?? this.assetType,
            type: this.assetType,
            granularity: this.granularity,
            metadata: {
                errors: [],
                minDate,
                maxDate,
            },
            data: [],
        };

        const dto = await this.getDto();

        // Map

        for (let data of dto) {
            const date = parseMoment(data.data, 'DD/MM/YYYY');
            const value = castPercent(+data.valor);

            const parsed = { assetCode: this.assetType, date: date.toDate(), value } as T;

            assetData.data.push(parsed);
        }

        assetData.data = assetData.data.filter(e => e.date >= minDate);
        assetData.data = assetData.data.filter(e => maxDate >= e.date);

        assetData.data = sortBy(assetData.data, e => e.date);

        return assetData;
    }

    // @Memoize({ cacheType: MemoizeCacheType.Storage })
    async getDto(): Promise<AssetSgsDto[]> {
        const data = await promiseRetry(
            () => HttpService.get<AssetSgsDto[]>(this.jsonUrl).then(r => r.data),
            3,
            err => this.logger.log(`Retry Error: ${err}`)
        );

        return data;
    }
}