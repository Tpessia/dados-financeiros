import { addDate, businessDaysInYear, round } from '@/@utils';
import { AppModule } from '@/app.module';
import { initAssetValue } from '@/core/services/AssetTransformers';
import { SearchService } from '@/search/services/search.service';
import { SelicDaySgsService } from '@/selic/services/selic-day-sgs.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = moduleRef.get(SearchService);
    
    const selicService = moduleRef.get(SelicDaySgsService);
    jest.spyOn(selicService, 'getDto').mockImplementation(async (...args) => [{ assetCode: 'SELIC.SA', date: new Date('2024-01-01'), value: 0.0001, currency: 'BRL' }]);
  });

  describe('search', () => {
    it('FixedRate', async () => {
      const rate = 0.1;
      const startDate = new Date(2024, 0, 1);
      const dateLength = 5;

      const data = await service.getAssets(`FIXED*${rate}`, startDate, addDate(startDate, dateLength));

      const assetData = data[0].data;
      const value = round(initAssetValue * Math.pow(1 + rate, (dateLength-1) / (businessDaysInYear(startDate.getFullYear())-1)), 2);

      expect(assetData.length).toBe(5);
      expect(assetData[assetData.length - 1].value).toBe(value);
    });
  });
});
