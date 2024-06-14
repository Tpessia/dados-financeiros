import { CoreModule } from '@/core/core.module';
import { ResponseInterceptor } from '@/core/middlewares/ResponseInterceptor';
import { FixedRateModule } from '@/fixed-rate/fixed-rate.module';
import { SearchModule } from '@/search/search.module';
import { GovBondModule } from '@/gov-bond/gov-bond.module';
import { IpcaModule } from '@/ipca/ipca.module';
import { SelicModule } from '@/selic/selic.module';
import { StockModule } from '@/stock/stock.module';
import { Module } from '@nestjs/common';
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
      serveRoot: '/',
      rootPath: join(__dirname, '..', 'public'),
    }),
    CoreModule,
    SearchModule,
    FixedRateModule,
    SelicModule,
    IpcaModule,
    GovBondModule,
    StockModule,
  ],
})
export class AppModule {}
