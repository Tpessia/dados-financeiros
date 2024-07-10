// import { DataJob } from '@/scheduler/enums/DataJob';
// import { SchedulerService } from '@/scheduler/services/scheduler.service';
// import { Controller, Get, Query } from '@nestjs/common';
// import { ApiQuery, ApiTags } from '@nestjs/swagger';

// @ApiTags('Scheduler')
// @Controller('scheduler')
// export class SchedulerController {
//     constructor(private schedulerService: SchedulerService) { }

//     @Get('run')
//     @ApiQuery({ name: 'jobs', isArray: true, enum: DataJob, example: Object.keys(DataJob) })
//     async runScheduler(@Query('jobs') jobs?: DataJob[]) {
//         jobs = (jobs != null ? Array.isArray(jobs) ? jobs : [jobs] : []) as DataJob[];
//         await this.schedulerService.run(...jobs);
//         return 'OK';
//     }
// }