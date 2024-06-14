import { SelicController } from '@/selic/controllers/selic.controller';
import { SelicDaySgsService } from '@/selic/services/selic-day-sgs.service';
import { SelicMonthSgsService } from '@/selic/services/selic-month-sgs.service';
import { Module } from '@nestjs/common';

@Module({
    controllers: [
        SelicController,
    ],
    providers: [
        SelicDaySgsService,
        SelicMonthSgsService,
    ],
    exports: [
        SelicDaySgsService,
        SelicMonthSgsService,
    ]
})
export class SelicModule {}