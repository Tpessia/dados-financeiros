import { HealthController } from '@/core/controllers/health.controller';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
    controllers: [
        HealthController,
    ],
})
export class CoreModule {}