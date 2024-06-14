import { DataSource } from '@/core/enums/DataSource';
import { BaseAssetService, GetDataParams } from '@/core/services/BaseAssetService';
import { HttpService } from '@/core/services/http.service';
import { Injectable, Scope } from '@nestjs/common';

// https://fc.yahoo.com
// https://query2.finance.yahoo.com/v1/test/getcrumb
// https://query1.finance.yahoo.com/v10/finance/quoteSummary/AAPL?modules=price,summaryDetail&crumb=

@Injectable({ scope: Scope.DEFAULT })
export class StockYahooSummaryService extends BaseAssetService {
    constructor() {
        super(DataSource.StockYahooSummary);
    }

    async getData({ assetCode }: GetDataParams) {
        if (assetCode == null) throw new Error('Invalid params: assetCode');
        const dto = await this.getDto(assetCode);
        return dto;
    }

    async getDto(ticker: string) {
        const { cookie, crumb } = await this.getAuth();
        const modules = ['assetProfile','summaryProfile','summaryDetail','esgScores','price','incomeStatementHistory','incomeStatementHistoryQuarterly','balanceSheetHistory','balanceSheetHistoryQuarterly','cashflowStatementHistory','cashflowStatementHistoryQuarterly','defaultKeyStatistics','financialData','calendarEvents','secFilings','recommendationTrend','upgradeDowngradeHistory','institutionOwnership','fundOwnership','majorDirectHolders','majorHoldersBreakdown','insiderTransactions','insiderHolders','netSharePurchaseActivity','earnings','earningsHistory','earningsTrend','industryTrend','indexTrend','sectorTrend'];
        const response = await HttpService.get(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=${modules.join(',')}&crumb=${crumb}`, { headers: { cookie, 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)' } });
        return response.data;
    }

    private async getAuth() {
        const url_scrape = 'https://fc.yahoo.com';

        const cookieResponse = await HttpService.get(url_scrape, { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)' }, validateStatus: () => true });
        const setCookieHeader = cookieResponse.headers['set-cookie'][0];
        const cookie = setCookieHeader.split(';')[0];

        const crumbResponse = await HttpService.get('https://query2.finance.yahoo.com/v1/test/getcrumb', { headers: { cookie, 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)' } });
        const crumb = crumbResponse.data;

        return {
            cookie: cookie,
            crumb: crumb,
        };
    }
}
