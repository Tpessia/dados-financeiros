import { SchedulerService } from '@/scheduler/services/scheduler.service';
import { Module } from '@nestjs/common';

@Module({
    // controllers: [
    //     SchedulerController,
    // ],
    providers: [
        SchedulerService,
    ],
    exports: [
        SchedulerService,
    ]
})
export class SchedulerModule {}