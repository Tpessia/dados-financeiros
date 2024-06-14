import { FixedRateController } from '@/fixed-rate/controllers/fixed-rate.controller';
import { FixedRateService } from '@/fixed-rate/services/fixed-rate.service';
import { Module } from '@nestjs/common';

@Module({
    controllers: [
        FixedRateController,
    ],
    providers: [
        FixedRateService,
    ],
    exports: [
        FixedRateService,
    ],
})
export class FixedRateModule {}
