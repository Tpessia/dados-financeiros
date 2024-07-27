import { SearchController } from '@/search/controllers/search.controller';
import { SearchService } from '@/search/services/search.service';
import { StockModule } from '@/stock/stock.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        StockModule,
    ],
    controllers: [
        SearchController,
    ],
    providers: [
        SearchService,
    ],
    exports: [
        SearchService,
    ]
})
export class SearchModule {}
