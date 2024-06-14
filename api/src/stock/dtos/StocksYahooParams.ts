export interface StocksYahooParams {
    interval: StocksYahooInterval;
    period?: StocksYahooPeriod;
    period1?: number;
    period2?: number;
    events: '' | 'div' | 'splits' | 'earn' | 'div,splits';
    includePrePost: boolean;  // Include pre-market and after-hours data
    includeAdjustedClose: boolean;  // Include adjusted close price in the results
    comparisons?: string; // e.g. "BOVA11.SA,ITUB4.SA"
}

export enum StocksYahooPeriod {
    Day1 = '1d',
    Day5 = '5d',
    Mon1 = '1mo',
    Mon3 = '3mo',
    Mon6 = '6mo',
    Year1 = '1y',
    Year2 = '2y',
    Year5 = '5y',
    Year10 = '10y',
    Ytd = 'ytd',
    Max = 'max'
}

export enum StocksYahooInterval {
    Min1 = '1m',
    Min2 = '2m',
    Min5 = '5m',
    Min15 = '15m',
    Min30 = '30m',
    Min60 = '60m',
    Min90 = '90m',
    Hour1 = '1h',
    Day1 = '1d',
    Day5 = '5d',
    Week1 = '1wk',
    Mon1 = '1mo',
    Mon3 = '3mo'
}
