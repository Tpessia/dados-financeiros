import { parseDate } from '@/@utils';
import { ErrorResponse } from '@/core/middlewares/ErrorFilter';
import { QueryRequiredPipe } from '@/core/middlewares/QueryRequired';
import { AssetHistData } from '@/core/models/AssetHistData';
import { IpcaData } from '@/ipca/models/IpcaData';
import { IpcaMonthIpeaService } from '@/ipca/services/ipca-month-ipea.service';
import { IpcaMonthSgsService } from '@/ipca/services/ipca-month-sgs.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiDefaultResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('IPCA')
@Controller('ipca')
export class IpcaController {
    constructor(
        private ipcaMonthSgsService: IpcaMonthSgsService,
        private ipcaMonthIpeaService: IpcaMonthIpeaService,
    ) {}

    @ApiQuery({ name: 'minDate', example: '2020-01-01' })
    @ApiQuery({ name: 'maxDate', example: '2020-01-31' })
    @ApiOkResponse({ type: AssetHistData<IpcaData> })
    @ApiDefaultResponse({ type: ErrorResponse })
    @Get('/month/sgs')
    async getIpcaMonthSgs(@Query('minDate', QueryRequiredPipe) minDate: string, @Query('maxDate', QueryRequiredPipe) maxDate: string): Promise<AssetHistData<IpcaData>> {
        const data = await this.ipcaMonthSgsService.getData({ minDate: parseDate(minDate), maxDate: parseDate(maxDate) });
        return data;
    }

    @ApiQuery({ name: 'minDate', example: '2020-01-01' })
    @ApiQuery({ name: 'maxDate', example: '2020-01-31' })
    @ApiOkResponse({ type: AssetHistData<IpcaData> })
    @ApiDefaultResponse({ type: ErrorResponse })
    @Get('/month/ipea')
    async getIpcaMonthIpea(@Query('minDate', QueryRequiredPipe) minDate: string, @Query('maxDate', QueryRequiredPipe) maxDate: string): Promise<AssetHistData<IpcaData>> {
        const data = await this.ipcaMonthIpeaService.getData({ minDate: parseDate(minDate), maxDate: parseDate(maxDate) });
        return data;
    }
}