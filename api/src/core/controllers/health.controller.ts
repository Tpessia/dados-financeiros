import { Controller, Get, Logger, Version } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    private logger = new Logger(HealthController.name);

    @Get()
    async healthCheck() {
        const msg = this.getHealthMessage();
        this.logger.log(msg);
        return msg;
    }

    @Version('1')
    @Get()
    async healthCheckV1() {
        const msg = `API v1: ${this.getHealthMessage()}`;
        this.logger.log(msg);
        return msg;
    }

    private getHealthMessage() {
        return `I'm healthy! ${new Date().toISOString()}`;
    }
}