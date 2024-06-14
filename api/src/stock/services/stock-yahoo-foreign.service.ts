import { DataSource } from '@/core/enums/DataSource';
import { AssetHistData } from '@/core/models/AssetHistData';
import { convertCurrency } from '@/core/services/AssetTransformers';
import { BaseAssetService, GetDataParams } from '@/core/services/BaseAssetService';
import { StockData } from '@/stock/models/StockData';
import { StockYahooService } from '@/stock/services/stock-yahoo.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class StockYahooForeignService extends BaseAssetService {
    constructor(private stockYahooService: StockYahooService) {
        super(DataSource.StockYahoo);
    }

    async getData({ assetCode, minDate, maxDate }: GetDataParams): Promise<AssetHistData<StockData>> {
        const [asset, currency] = assetCode.split(':'); // SPY:USDBRL
        const currencyData = this.stockYahooService.getData({ assetCode: `${currency}=X`, minDate, maxDate }).then(e => e.data);
        const assetData = await this.stockYahooService.getData({ assetCode: asset, minDate, maxDate });
        const data = convertCurrency(assetData.data, await currencyData);
        return {
            ...assetData,
            data: data,
        };
    }
}
