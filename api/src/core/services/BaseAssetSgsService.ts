import { Memoize, MemoizeCacheType, addDate, castPercent, dateToIsoStr, dateToStr, normalizeTimezone, parseMoment, promiseRetry, splitDateRanges, tryParseJson } from '@/@utils';
import { DataSource } from '@/core/enums/DataSource';
import { AssetData } from '@/core/models/AssetData';
import { AssetHistData } from '@/core/models/AssetHistData';
import { AssetSgsDto } from '@/core/models/AssetSgsDto';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { ConfigService } from '@/core/services/config.service';
import { BaseAssetService, GetDataParams } from '@/core/services/BaseAssetService';
import { HttpService } from '@/core/services/http.service';
import { sortBy } from 'lodash';

export abstract class BaseAssetSgsService<T extends AssetData> extends BaseAssetService {
    protected assetType: AssetType;
    protected granularity: DataGranularity;
    protected jsonUrl: string;

    private static cacheKey = () => dateToIsoStr(addDate(normalizeTimezone(new Date()), 0, -ConfigService.config.cacheTime));

    constructor(type: DataSource, assetType: AssetType, granularity: DataGranularity, code: string) {
        super(type);
        this.assetType = assetType;
        this.granularity = granularity;
        this.jsonUrl = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json`;
    }

    async getData(params: GetDataParams): Promise<AssetHistData<T>> {
        this.validateParams(params, ['minDate','maxDate']);

        if (params.minDate.getTime() <= 0) params.minDate = new Date(2000, 0, 1);
        if (params.maxDate.getTime() <= 0) params.maxDate = new Date();

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

        const dto = await this.getDto(params.minDate, params.maxDate);

        assetData.data = dto;

        assetData.data.forEach(e => e.assetCode = params.assetCode ?? e.assetCode);

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
    async getDto(minDate: Date, maxDate: Date): Promise<T[]> {
        this.logger.log(`--- Fetching data for ${BaseAssetSgsService.cacheKey()} ---`);

        const func = async () => {
            const fetch = async (minDate: Date, maxDate: Date) => {
                const url = `${this.jsonUrl}&dataInicial=${dateToStr(minDate)}&dataFinal=${dateToStr(maxDate)}`;
                console.log('url', url);
                const dto: AssetSgsDto[] = await HttpService.get(url, { responseType: 'text' }).then(r => JSON.parse(r.data));
                if (!dto || !dto.length) throw new Error(`[${this.assetType}] Invalid data from ${this.jsonUrl}: ${JSON.stringify(dto).slice(0, 100)}`);
                return dto;
            };

            const dateRanges = splitDateRanges(minDate, maxDate, 9);
            // TODO: improve not to lose all request if one fails
            const results = await Promise.all(dateRanges.map(([start, end]) => fetch(start, end)));
            return results.flat();
        };

        let dto = await promiseRetry(func, 5, err => this.logger.warn(`Retry Error: ${err}`));

        // Map

        const data: T[] = [];

        for (let item of dto) {
            const date = parseMoment(item.data, 'DD/MM/YYYY');
            const value = castPercent(+item.valor);

            const parsed = { assetCode: this.assetType, date: date.toDate(), value, currency: 'BRL' } as T;

            data.push(parsed);
        }

        return data;
    }
}