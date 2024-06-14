import { HealthController } from '@/core/controllers/health.controller';
import { Test, TestingModule } from '@nestjs/testing';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  describe('health-check', () => {
    it('should return healthy', async () => {
      expect(await controller.healthCheck()).toMatch(/^I'm healthy!/);
    });
  });
});
