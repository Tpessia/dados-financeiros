import { parseDate } from '@/@utils';
import { ErrorResponse } from '@/core/middlewares/ErrorFilter';
import { QueryRequiredPipe } from '@/core/middlewares/QueryRequired';
import { AssetData } from '@/core/models/AssetData';
import { AssetHistData } from '@/core/models/AssetHistData';
import { SearchService } from '@/search/services/search.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiDefaultResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('search')
export class SearchController {
    constructor(private searchService: SearchService) {}

    @ApiOperation({ summary: 'Search by assetCodes' })
    @ApiQuery({ name: 'assetCodes', description: 'e.g. TSLA, BOVA11.SA:USDBRL, IPCA.SA, FIXED\\*0.1, SELIC.SA\\*0.9' })
    @ApiQuery({ name: 'minDate', example: '2020-01-01' })
    @ApiQuery({ name: 'maxDate', example: '2020-01-31' })
    @ApiOkResponse({ type: AssetHistData<AssetData>, isArray: true })
    @ApiDefaultResponse({ type: ErrorResponse })
    @Get()
    async getIpcaMonthSgs(@Query('assetCodes', QueryRequiredPipe) assetCodes: string, @Query('minDate', QueryRequiredPipe) minDate: string, @Query('maxDate', QueryRequiredPipe) maxDate: string): Promise<AssetHistData<AssetData>[]> {
        const data = await this.searchService.getAssets(assetCodes, parseDate(minDate), parseDate(maxDate));
        return data;
    }
}
