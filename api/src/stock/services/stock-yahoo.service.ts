import { dateToUnix, isValidDate, round } from '@/@utils';
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
    async getData(params: GetDataParams): Promise<AssetHistData<StockData>> {
        this.validateParams(params, ['minDate','maxDate','assetCode']);

        const assetData: AssetHistData<StockData> = {
            key: params.assetCode,
            type: AssetType.Stock,
            granularity: DataGranularity.Day,
            metadata: {
                errors: [],
                minDate: params.minDate,
                maxDate: params.maxDate,
            },
            data: [],
        };

        const dto = await this.getDto(params.assetCode, params.minDate, params.maxDate);

        // Map

        const stocksDto = dto.chart.result[0];

        for (let i in stocksDto.timestamp) {
            const timestamp = stocksDto?.timestamp?.[i];
            const date = new Date(timestamp * 1000);

            const assetCode = stocksDto?.meta?.symbol;

            const quote = stocksDto?.indicators?.quote?.[0];
            const adj = stocksDto?.indicators?.adjclose?.[0];

            const volume = quote?.volume?.[i];
            const open = quote?.open?.[i];
            const high = quote?.high?.[i];
            const low = quote?.low?.[i];
            const close = quote?.close?.[i];
            const adjClose = adj?.adjclose?.[i];
            const currency = stocksDto?.meta.currency;

            const dividend = stocksDto?.events?.dividends?.[timestamp];
            const dividendAmount = dividend?.amount;

            const split = stocksDto?.events?.splits?.[timestamp];
            const splitCoefficient = split && (split?.numerator / split?.denominator);

            const adjRatio = adjClose / close;

            // Map

            const stockData: StockData = {
                assetCode: assetCode,
                date: date,
                value: round(close, 2),
                currency: currency,
                volume: round(volume, 2),
                open: round(open, 2),
                high: round(high, 2),
                low: round(low, 2),
                close: round(close, 2),
                adjRatio: round(adjRatio, 2),
                adjOpen: round(open * adjRatio, 2),
                adjHigh: round(high * adjRatio, 2),
                adjLow: round(low * adjRatio, 2),
                adjClose: round(adjClose, 2),
                dividendAmount: dividendAmount,
                splitCoefficient: splitCoefficient,
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
                    data: JSON.stringify(stockData),
                });
                continue;
            }

            assetData.data.push(stockData);
        }

        return assetData;
    }

    async getDto(ticker: string, minDate: Date, maxDate: Date) {
        const params: StocksYahooParams = {
            interval: StocksYahooInterval.Day1,
            period1: +Math.ceil(dateToUnix(minDate)),
            period2: +Math.floor(dateToUnix(maxDate)),
            events: 'div,splits', // div,splits,earn / all
            includePrePost: true,
            includeAdjustedClose: true,
        };

        try {
            const data = await HttpService.get<StocksYahooDto>(`${this.jsonUrl}/${ticker}`, { params }).then(r => r.data);
            const symbol = data.chart.result?.[0]?.meta?.symbol;
            if (symbol !== ticker) throw new Error(`Ticker ${ticker} not found!${symbol ? ` Did you mean ${symbol}?` : ''}`);
            return data;
        } catch (err) {
            const errMsg = err?.message ?? err?.toString();
            this.logger.error(`Yahoo Error Msg: ${errMsg}`);
            throw new Error(`Yahoo Error: ${ticker} - ${err?.response ? `${err?.response?.status} ${err?.response?.statusText}` : errMsg}`);
        }
    }
}
