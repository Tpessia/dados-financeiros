import { AppModule } from '@/app.module';
import { SearchService } from '@/search/services/search.service';
import { SelicDaySgsService } from '@/selic/services/selic-day-sgs.service';
import { Test, TestingModule } from '@nestjs/testing';
import { addDays, businessDaysInYear } from '@/@utils';
import { round } from 'lodash';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = moduleRef.get(SearchService);
    
    const selicService = moduleRef.get(SelicDaySgsService);
    jest.spyOn(selicService, 'getDto').mockImplementation(async (...args) => [{ data: '01/01/2024', valor: '0.01' }]);
  });

  describe('search', () => {
    it('FixedRate', async () => {
      const rate = 0.1;
      const startDate = new Date(2024, 0, 1);
      const dateLength = 5;

      const data = await service.getAssets(`FIXED*${rate}`, startDate, addDays(startDate, dateLength));

      const assetData = data[0].data;
      const value = round(1000 * Math.pow(1 + rate, (dateLength-1) / (businessDaysInYear(startDate.getFullYear())-1)), 2);

      expect(assetData.length).toBe(5);
      expect(assetData[assetData.length - 1].value).toBe(value);
    });
  });
});
