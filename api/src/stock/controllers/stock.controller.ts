import { parseDate } from '@/@utils';
import { ErrorResponse } from '@/core/middlewares/ErrorFilter';
import { QueryRequiredPipe } from '@/core/middlewares/QueryRequired';
import { AssetHistData } from '@/core/models/AssetHistData';
import { StocksYahooInterval } from '@/stock/dtos/StocksYahooParams';
import { StockData } from '@/stock/models/StockData';
import { StockYahooSummaryService } from '@/stock/services/stock-yahoo-summary.service';
import { StockYahooService } from '@/stock/services/stock-yahoo.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Ações')
@Controller('acao')
export class StockController {
    constructor(
        private readonly stockYahooService: StockYahooService,
        private readonly stockYahooSummaryService: StockYahooSummaryService,
    ) {}

    @ApiOkResponse({ type: AssetHistData<StockData> })
    @ApiDefaultResponse({ type: ErrorResponse })
    @Get('quotes')
    async getData(@Query('ticker', QueryRequiredPipe) ticker: string, @Query('minDate', QueryRequiredPipe) minDate: string, @Query('maxDate', QueryRequiredPipe) maxDate: string, @Query('interval', QueryRequiredPipe) interval: StocksYahooInterval): Promise<AssetHistData<StockData>> {
        const data = await this.stockYahooService.getData({ assetCode: ticker, minDate: parseDate(minDate), maxDate: parseDate(maxDate) });
        return data;
    }

    @Get('summary')
    async getData2(@Query('ticker', QueryRequiredPipe) ticker: string) {
        const data = await this.stockYahooSummaryService.getData({ assetCode: ticker });
        return data;
    }
}