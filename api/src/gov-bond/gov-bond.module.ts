import { GovBondController } from '@/gov-bond/controllers/gov-bond.controller';
import { GovBondDayLastTdService } from '@/gov-bond/services/gov-bond-day-last-td.service';
import { GovBondDaySiswebService } from '@/gov-bond/services/gov-bond-day-sisweb.service';
import { GovBondDayTransparenteService } from '@/gov-bond/services/gov-bond-day-transparente.service';
import { Module } from '@nestjs/common';

@Module({
    controllers: [
        GovBondController,
    ],
    providers: [
        GovBondDaySiswebService,
        GovBondDayTransparenteService,
        GovBondDayLastTdService,
    ],
    exports: [
        GovBondDaySiswebService,
        GovBondDayTransparenteService,
        GovBondDayLastTdService,
    ]
})
export class GovBondModule {}