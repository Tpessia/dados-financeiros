import { SearchController } from '@/search/controllers/search.controller';
import { SearchService } from '@/search/services/search.service';
import { Module } from '@nestjs/common';

@Module({
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
