import { HttpService } from '@/core/services/http.service';
import { StockSearchData } from '@/stock/models/StockSearchData';
import { Injectable, Scope } from '@nestjs/common';

// https://query2.finance.yahoo.com/v1/finance/search?q=BOVA

@Injectable({ scope: Scope.DEFAULT })
export class StockYahooSearchService {
    async getData(ticker: string): Promise<StockSearchData[]> {
        if (ticker == null || ticker.length === 0) return [];

        const dto = await this.getDto(ticker);

        const data: StockSearchData[] = dto.quotes?.map(e => ({
            exchange: e.exchange,
            exchangeStr: e.exchDisp,
            symbol: e.symbol,
            alias: e.shortname,
            aliasStr: e.longname,
            type: e.quoteType,
            typeStr: e.typeDisp,
            score: e.score,
        })) ?? [];

        return data.filter(e => ['EQUITY','INDEX','CURRENCY','ETF','MUTUALFUND'].includes(e.type));
    }

    async getDto(ticker: string) {
        // TODO: add types
        const response = await HttpService
            .get(`https://query2.finance.yahoo.com/v1/finance/search?q=${ticker}`)
            .catch(e => { throw `Invalid ticker search: ${ticker}`; });
        return response.data;
    }
}
