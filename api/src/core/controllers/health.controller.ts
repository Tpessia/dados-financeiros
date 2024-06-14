import { Controller, Get, Logger } from '@nestjs/common';
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

    private getHealthMessage() {
        return `I'm healthy! ${new Date().toISOString()}`;
    }
}