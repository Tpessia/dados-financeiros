import { parseDate } from '@/@utils';
import { ErrorResponse } from '@/core/middlewares/ErrorFilter';
import { QueryRequiredPipe } from '@/core/middlewares/QueryRequired';
import { AssetHistData } from '@/core/models/AssetHistData';
import { SelicData } from '@/selic/models/SelicData';
import { SelicDaySgsService } from '@/selic/services/selic-day-sgs.service';
import { SelicMonthSgsService } from '@/selic/services/selic-month-sgs.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiDefaultResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Selic')
@Controller('selic')
export class SelicController {
    constructor(
        private selicDaySgsService: SelicDaySgsService,
        private selicMonthSgsService: SelicMonthSgsService,
    ) {}

    @ApiQuery({ name: 'minDate', example: '2020-01-01' })
    @ApiQuery({ name: 'maxDate', example: '2020-01-31' })
    @ApiOkResponse({ type: AssetHistData<SelicData> })
    @ApiDefaultResponse({ type: ErrorResponse })
    @Get('/day/sgs')
    async getSelicDaySgs(@Query('minDate', QueryRequiredPipe) minDate: string, @Query('maxDate', QueryRequiredPipe) maxDate: string): Promise<AssetHistData<SelicData>> {
        const data = await this.selicDaySgsService.getData({ minDate: parseDate(minDate), maxDate: parseDate(maxDate) });
        return data;
    }

    @ApiQuery({ name: 'minDate', example: '2020-01-01' })
    @ApiQuery({ name: 'maxDate', example: '2020-01-31' })
    @ApiOkResponse({ type: AssetHistData<SelicData> })
    @ApiDefaultResponse({ type: ErrorResponse })
    @Get('/month/sgs')
    async getSelicMonthSgs(@Query('minDate', QueryRequiredPipe) minDate: string, @Query('maxDate', QueryRequiredPipe) maxDate: string): Promise<AssetHistData<SelicData>> {
        const data = await this.selicMonthSgsService.getData({ minDate: parseDate(minDate), maxDate: parseDate(maxDate) });
        return data;
    }
}