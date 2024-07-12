import { parseDate } from '@/@utils';
import { ErrorResponse } from '@/core/middlewares/ErrorFilter';
import { QueryRequiredPipe } from '@/core/middlewares/QueryRequired';
import { AssetData } from '@/core/models/AssetData';
import { AssetHistData } from '@/core/models/AssetHistData';
import { FixedRateService } from '@/fixed-rate/services/fixed-rate.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Fixed Rate')
@Controller('fixed-rate')
export class FixedRateController {
    constructor(
        private fixedRateService: FixedRateService,
    ) {}

    @ApiOkResponse({ type: AssetHistData<AssetData> })
    @ApiDefaultResponse({ type: ErrorResponse })
    @Get()
    async getFixedRate(@Query('minDate', QueryRequiredPipe) rate: string, @Query('minDate', QueryRequiredPipe) minDate: string, @Query('maxDate', QueryRequiredPipe) maxDate: string): Promise<AssetHistData<AssetData>> {
        if (isNaN(+rate)) throw new Error('Rate must be a number');
        const data = await this.fixedRateService.getData({ rate: +rate, minDate: parseDate(minDate), maxDate: parseDate(maxDate) });
        return data;
    }
}