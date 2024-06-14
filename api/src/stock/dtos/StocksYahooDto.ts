export interface StocksYahooDto {
    chart: {
        result: ResultDto[];
        error: any;
    };
}

interface ResultDto {
    meta: {
        currency: string;
        symbol: string;
        exchangeName: string;
        instrumentType: string;
        firstTradeDate: number;
        regularMarketTime: number;
        gmtoffset: number;
        timezone: string;
        exchangeTimezoneName: string;
        regularMarketPrice: number;
        chartPreviousClose: number;
        priceHint: number;
        currentTradingPeriod: CurrentTradingPeriod;
        dataGranularity: string;
        range: string;
        validRanges: string[];
    };
    timestamp: number[];
    events: {
        dividends: Record<string, Dividend>;
        splits: Record<string, Splits>;
    };
    indicators: {
        quote: Quote[];
        adjclose: {
            adjclose: number[];
        }[]
    };
}

interface CurrentTradingPeriod {
    pre: CurrentTradingPeriodValue;
    regular: CurrentTradingPeriodValue;
    post: CurrentTradingPeriodValue;
}

interface CurrentTradingPeriodValue {
    timezone: string;
    start: number;
    end: number;
    gmtoffset: number;
}

interface Dividend {
    amount: number;
    date: number;
}

interface Splits {
    date: number;
    numerator: number;
    denominator: number;
    splitRatio: string;
}

interface Quote {
    volume: number[];
    open: number[];
    high: number[];
    low: number[];
    close: number[];
}