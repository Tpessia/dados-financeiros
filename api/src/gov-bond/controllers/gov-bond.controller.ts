import { parseDate } from '@/@utils';
import { ErrorResponse } from '@/core/middlewares/ErrorFilter';
import { QueryRequiredPipe } from '@/core/middlewares/QueryRequired';
import { AssetHistData } from '@/core/models/AssetHistData';
import { GovBondData } from '@/gov-bond/models/GovBondData';
import { GovBondDayLastTdService } from '@/gov-bond/services/gov-bond-day-last-td.service';
import { GovBondDaySiswebService } from '@/gov-bond/services/gov-bond-day-sisweb.service';
import { GovBondDayTransparenteService } from '@/gov-bond/services/gov-bond-day-transparente.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiDefaultResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Tesouro Direto')
@Controller('tesouro-direto')
export class GovBondController {
    constructor(
        private readonly govBondDaySiswebService: GovBondDaySiswebService,
        private readonly govBondDayTransparenteService: GovBondDayTransparenteService,
        private readonly govBondDayLastTdService: GovBondDayLastTdService,
    ) { }

    // @ApiQuery({ name: 'minDate', example: '2020-01-01' })
    // @ApiQuery({ name: 'maxDate', example: '2020-01-31' })
    // @ApiOkResponse({ type: AssetHistData<GovBondData> })
    // @ApiDefaultResponse({ type: ErrorResponse })
    // @Get('day/sisweb')
    // async getDaySisweb(@Query('minDate', QueryRequiredPipe) minDate: string, @Query('maxDate', QueryRequiredPipe) maxDate: string): Promise<AssetHistData<GovBondData>> {
    //     const data = await this.govBondDaySiswebService.getData({ minDate: parseDate(minDate), maxDate: parseDate(maxDate) });
    //     return data;
    // }

    @ApiQuery({ name: 'minDate', example: '2020-01-01' })
    @ApiQuery({ name: 'maxDate', example: '2020-01-31' })
    @ApiOkResponse({ type: AssetHistData<GovBondData> })
    @ApiDefaultResponse({ type: ErrorResponse })
    @Get('day/transparente')
    async getDayTransparente(@Query('minDate', QueryRequiredPipe) minDate: string, @Query('maxDate', QueryRequiredPipe) maxDate: string): Promise<AssetHistData<GovBondData>> {
        const data = await this.govBondDayTransparenteService.getData({ minDate: parseDate(minDate), maxDate: parseDate(maxDate) });
        return data;
    }

    @ApiOkResponse({ type: AssetHistData<GovBondData> })
    @ApiDefaultResponse({ type: ErrorResponse })
    @Get('day/last-td')
    async getDayLastTd(): Promise<AssetHistData<GovBondData>> {
        const data = await this.govBondDayLastTdService.getData({});
        return data;
    }
}