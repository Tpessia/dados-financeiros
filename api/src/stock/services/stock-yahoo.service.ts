import { dateToUnix, isValidDate } from '@/@utils';
import { DataSource } from '@/core/enums/DataSource';
import { AssetHistData } from '@/core/models/AssetHistData';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { BaseAssetService, GetDataParams } from '@/core/services/BaseAssetService';
import { HttpService } from '@/core/services/http.service';
import { StocksYahooDto } from '@/stock/dtos/StocksYahooDto';
import { StocksYahooInterval, StocksYahooParams } from '@/stock/dtos/StocksYahooParams';
import { StockData } from '@/stock/models/StockData';
import { Injectable, Scope } from '@nestjs/common';

// https://query1.finance.yahoo.com/v8/finance/chart/BOVA11.SA?interval=1d&period1=1640995200&period2=1651363200&events=div,splits&includePrePost=true

@Injectable({ scope: Scope.DEFAULT })
export class StockYahooService extends BaseAssetService {
    private jsonUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';

    constructor() {
        super(DataSource.StockYahoo);
    }

    // Inspired by: https://github.com/ranaroussi/yfinance/blob/master/yfinance/base.py
    async getData({ assetCode, minDate, maxDate }: GetDataParams): Promise<AssetHistData<StockData>> {
        if (assetCode == null || minDate == null || maxDate == null) throw new Error('Invalid params: assetCode, minDate, maxDate');

        const assetData: AssetHistData<StockData> = {
            key: assetCode ?? AssetType.Stock,
            type: AssetType.Stock,
            granularity: DataGranularity.Day,
            metadata: {
                errors: [],
                minDate,
                maxDate,
            },
            data: [],
        };

        const dto = await this.getDto(assetCode, minDate, maxDate);

        // Map

        const stocksDto = dto.chart.result[0];

        for (let i in stocksDto.timestamp) {
            const timestamp = stocksDto?.timestamp?.[i];
            const date = new Date(timestamp * 1000);

            const volume = stocksDto?.indicators?.quote?.[0]?.volume?.[i];
            const open = stocksDto?.indicators?.quote?.[0]?.open?.[i];
            const high = stocksDto?.indicators?.quote?.[0]?.high?.[i];
            const low = stocksDto?.indicators?.quote?.[0]?.low?.[i];
            const close = stocksDto?.indicators?.quote?.[0]?.close?.[i];
            const adjClose = stocksDto?.indicators?.adjclose?.[0]?.adjclose?.[i];

            const dividend = stocksDto?.events?.dividends?.[timestamp];
            const dividendAmount = dividend?.amount;

            const split = stocksDto?.events?.splits?.[timestamp];
            const splitCoefficient = split && (split?.numerator / split?.denominator);

            const adjRatio = adjClose / close;

            // Map

            const dataData: StockData = {
                assetCode,
                value: close,
                date: date,
                volume: volume,
                open: open,
                high: high,
                low: low,
                close: close,
                adjRatio: adjRatio,
                adjOpen: open * adjRatio,
                adjHigh: high * adjRatio,
                adjLow: low * adjRatio,
                adjClose: adjClose,
                dividendAmount: dividendAmount,
                splitCoefficient: splitCoefficient
            };

            // Validate

            const isValid = isValidDate(date)
                && volume != null && !isNaN(volume)
                && open != null && !isNaN(open)
                && high != null && !isNaN(high)
                && low != null && !isNaN(low)
                && close != null && !isNaN(close);

            if (!isValid) {
                assetData.metadata.errors.push({
                    date: date,
                    message: 'Invalid Data',
                    data: JSON.stringify(dataData),
                });
                continue;
            }

            assetData.data.push(dataData);
        }

        return assetData;
    }

    async getDto(ticker: string, minDate: Date, maxDate: Date) {
        const params: StocksYahooParams = {
            interval: StocksYahooInterval.Day1,
            period1: +dateToUnix(minDate).toFixed(),
            period2: +dateToUnix(maxDate).toFixed(),
            events: 'div,splits', // div,splits,earn / all
            includePrePost: true,
            includeAdjustedClose: true,
        };

        const data = await HttpService.get<StocksYahooDto>(`${this.jsonUrl}/${ticker}`, { params }).then(r => r.data);

        return data;
    }
}
