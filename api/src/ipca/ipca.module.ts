import { IpcaController } from '@/ipca/controllers/ipca.controller';
import { ImabDaySgsService } from '@/ipca/services/imab-day-sgs.service';
import { IpcaDaySgsService } from '@/ipca/services/ipca-day-sgs.service';
import { IpcaMonthIpeaService } from '@/ipca/services/ipca-month-ipea.service';
import { IpcaMonthSgsService } from '@/ipca/services/ipca-month-sgs.service';
import { Module } from '@nestjs/common';

@Module({
    controllers: [
        IpcaController,
    ],
    providers: [
        IpcaMonthIpeaService,
        IpcaMonthSgsService,
        IpcaDaySgsService,
        ImabDaySgsService,
    ],
    exports: [
        IpcaMonthIpeaService,
        IpcaMonthSgsService,
        IpcaDaySgsService,
        ImabDaySgsService,
    ]
})
export class IpcaModule {}