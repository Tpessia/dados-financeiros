import { StockController } from '@/stock/controllers/stock.controller';
import { StockYahooForeignService } from '@/stock/services/stock-yahoo-foreign.service';
import { StockYahooSearchService } from '@/stock/services/stock-yahoo-search.service';
import { StockYahooSummaryService } from '@/stock/services/stock-yahoo-summary.service';
import { StockYahooService } from '@/stock/services/stock-yahoo.service';
import { Module } from '@nestjs/common';

@Module({
    controllers: [
        StockController,
    ],
    providers: [
        StockYahooService,
        StockYahooForeignService,
        StockYahooSummaryService,
        StockYahooSearchService,
    ],
    exports: [
        StockYahooService,
        StockYahooForeignService,
        StockYahooSummaryService,
        StockYahooSearchService,
    ]
})
export class StockModule {}