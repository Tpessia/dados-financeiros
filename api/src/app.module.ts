import { CoreModule } from '@/core/core.module';
import { ResponseInterceptor } from '@/core/middlewares/ResponseInterceptor';
import { FixedRateModule } from '@/fixed-rate/fixed-rate.module';
import { GovBondModule } from '@/gov-bond/gov-bond.module';
import { IpcaModule } from '@/ipca/ipca.module';
import { SchedulerModule } from '@/scheduler/scheduler.module';
import { SchedulerService } from '@/scheduler/services/scheduler.service';
import { SearchModule } from '@/search/search.module';
import { SelicModule } from '@/selic/selic.module';
import { StockModule } from '@/stock/stock.module';
import { Logger, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: ErrorFilter,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
  imports: [
    ServeStaticModule.forRoot({
      serveRoot: '/api',
      rootPath: join(__dirname, 'public'),
    }),
    CoreModule,
    SearchModule,
    FixedRateModule,
    SelicModule,
    IpcaModule,
    GovBondModule,
    StockModule,
    SchedulerModule,
  ],
})
export class AppModule {
  private logger = new Logger(AppModule.name);

  constructor(private schedulerService: SchedulerService) {}

  async onModuleInit(): Promise<void> {
    // Scheduler Init
    await this.schedulerService.start();
  }

  // main.ts:app.enableShutdownHooks();
  // async onModuleDestroy(signal: string) {
  //   try {
  //     await this.dbContext?.close();
  //   } catch (err) {
  //     this.logger.error(err);
  //   }
  // }
}
