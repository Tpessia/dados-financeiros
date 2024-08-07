import { parseDate } from '@/@utils';
import { ErrorResponse } from '@/core/middlewares/ErrorFilter';
import { QueryRequiredPipe } from '@/core/middlewares/QueryRequired';
import { AssetHistData } from '@/core/models/AssetHistData';
import { StockData } from '@/stock/models/StockData';
import { StockSearchData } from '@/stock/models/StockSearchData';
import { StockYahooSearchService } from '@/stock/services/stock-yahoo-search.service';
import { StockYahooSummaryService } from '@/stock/services/stock-yahoo-summary.service';
import { StockYahooService } from '@/stock/services/stock-yahoo.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiDefaultResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Ações')
@Controller('acao')
export class StockController {
    constructor(
        private readonly stockYahooService: StockYahooService,
        private readonly stockYahooSummaryService: StockYahooSummaryService,
        private readonly stockYahooSearchService: StockYahooSearchService,
    ) {}

    @ApiQuery({ name: 'ticker', description: 'e.g. TSLA, BOVA11.SA' })
    @ApiQuery({ name: 'minDate', example: '2020-01-01' })
    @ApiQuery({ name: 'maxDate', example: '2020-01-31' })
    @ApiOkResponse({ type: AssetHistData<StockData> })
    @ApiDefaultResponse({ type: ErrorResponse })
    @Get('quotes')
    async getData(@Query('ticker', QueryRequiredPipe) ticker: string, @Query('minDate', QueryRequiredPipe) minDate: string, @Query('maxDate', QueryRequiredPipe) maxDate: string): Promise<AssetHistData<StockData>> {
        const data = await this.stockYahooService.getData({ assetCode: ticker, minDate: parseDate(minDate), maxDate: parseDate(maxDate) });
        return data;
    }

    @Get('summary')
    async getSummary(@Query('ticker', QueryRequiredPipe) ticker: string) {
        const data = await this.stockYahooSummaryService.getData(ticker);
        return data;
    }

    @Get('search')
    async search(@Query('ticker', QueryRequiredPipe) ticker: string): Promise<StockSearchData[]> {
        const data = await this.stockYahooSearchService.getData(ticker);
        return data;
    }
}