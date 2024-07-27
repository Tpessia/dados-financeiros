import { Memoize, MemoizeCacheType, addDate, castPercent, dateToIsoStr, normalizeTimezone, parseMoment, promiseRetry, tryParseJson } from '@/@utils';
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

    private static cacheKey = () => dateToIsoStr(addDate(normalizeTimezone(new Date()), 0, -12));

    constructor(type: DataSource, assetType: AssetType, granularity: DataGranularity, code: string) {
        super(type);
        this.assetType = assetType;
        this.granularity = granularity;
        this.jsonUrl = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json`;
    }

    async getData(params: GetDataParams): Promise<AssetHistData<T>> {
        this.validateParams(params, ['minDate','maxDate']);

        const assetData: AssetHistData<T> = {
            key: params.assetCode ?? this.assetType,
            type: this.assetType,
            granularity: this.granularity,
            metadata: {
                errors: [],
                minDate: params.minDate,
                maxDate: params.maxDate,
            },
            data: [],
        };

        const dto = await this.getDto();

        // Map

        for (let data of dto) {
            const date = parseMoment(data.data, 'DD/MM/YYYY');
            const value = castPercent(+data.valor);

            const parsed = { assetCode: params.assetCode ?? this.assetType, date: date.toDate(), value, currency: 'BRL' } as T;

            assetData.data.push(parsed);
        }

        assetData.data = assetData.data.filter(e => e.date >= params.minDate);
        assetData.data = assetData.data.filter(e => params.maxDate >= e.date);

        assetData.data = sortBy(assetData.data, e => e.date);

        return assetData;
    }

    @Memoize({
        cacheType: MemoizeCacheType.Storage,
        itemKey: (config, args, cache) => BaseAssetSgsService.cacheKey(),
        onCall: (config, args, cache) => cache.invalidate(e => e !== BaseAssetSgsService.cacheKey())
    })
    async getDto(): Promise<AssetSgsDto[]> {
        this.logger.log(`--- Fetching data for ${BaseAssetSgsService.cacheKey()} ---`);

        let data = await promiseRetry(
            () => HttpService.get(this.jsonUrl, { responseType: 'text' }).then(r => r.data),
            3,
            err => this.logger.warn(`Retry Error: ${err}`)
        );

        data = tryParseJson<AssetSgsDto[]>(data, undefined, false);
        if (!data) throw new Error(`[${this.assetType}] Invalid data from ${this.jsonUrl}`);

        return data;
    }
}