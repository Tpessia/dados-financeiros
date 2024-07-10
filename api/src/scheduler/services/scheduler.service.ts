import { dateTimeToIsoStr, promiseParallelAll } from '@/@utils';
import { DataSource } from '@/core/enums/DataSource';
import { BaseAssetService } from '@/core/services/BaseAssetService';
import { GovBondDayTransparenteService } from '@/gov-bond/services/gov-bond-day-transparente.service';
import { ImabDaySgsService } from '@/ipca/services/imab-day-sgs.service';
import { IpcaDaySgsService } from '@/ipca/services/ipca-day-sgs.service';
import { SelicDaySgsService } from '@/selic/services/selic-day-sgs.service';
import { Injectable, Logger, Scope, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as schedule from 'node-schedule';

// TODO: run on new worker / thread
// BondsDayTransparenteService takes 2 min on "Saving on repository"

@Injectable({ scope: Scope.DEFAULT })
export class SchedulerService {
    private logger = new Logger('Scheduler');
    private services: Partial<Record<DataSource, Type>> = {
        [DataSource.SelicDaySgs]: SelicDaySgsService,
        [DataSource.IpcaDaySgs]: IpcaDaySgsService,
        [DataSource.ImabDaySgs]: ImabDaySgsService,
        [DataSource.GovBondDayTransparente]: GovBondDayTransparenteService,
    };

    constructor(private moduleRef: ModuleRef) {}

    async run(...services: DataSource[]) {
        if (!services?.length) services = Object.keys(this.services) as DataSource[];
        this.logger.log(`Running jobs: ${services.join(', ')}`);
        const funcs = Object.entries(this.services)
            .filter(job => services.includes(job[0] as DataSource))
            .map(job => () => this.runService(job[1]));
        await promiseParallelAll(funcs, 2);
        this.logger.log(`Finished jobs (${funcs.length})`);
    }

    async start() {
        // At noon (cacheKey reset)
        const job1 = schedule.scheduleJob({ tz: 'America/Sao_Paulo', rule: '0 0 12 * * *' }, async () => {
            this.logger.log(`<JOB1> ${dateTimeToIsoStr(new Date())}`);
            await this.run();
            this.logger.log(`<\\JOB1> ${dateTimeToIsoStr(new Date())}`);
        });

        setTimeout(async () => {
            const preLoad = ['prod','local'].includes(process.env.NODE_ENV);
            if (preLoad) await this.run();
        }, 5000);
    }

    private async runService(type: Type) {
        const service: BaseAssetService = await this.moduleRef.resolve(type, undefined, { strict: false });
        try {
            await service.getData({ minDate: new Date(0), maxDate: new Date(0) });
        } catch (err) {
            this.logger.error(`[${service.type}] ${err.toString()}`, err.stack);
        }
    }
}