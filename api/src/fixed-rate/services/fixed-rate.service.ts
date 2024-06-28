import { DataSource } from '@/core/enums/DataSource';
import { AssetData } from '@/core/models/AssetData';
import { AssetHistData } from '@/core/models/AssetHistData';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { generateFixedRate, initValue } from '@/core/services/AssetTransformers';
import { BaseAssetService, GetDataParams } from '@/core/services/BaseAssetService';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class FixedRateService extends BaseAssetService {
    constructor() {
        super(DataSource.FixedRate);
    }

    async getData({ assetCode, minDate, maxDate, rate }: GetDataParams): Promise<AssetHistData<AssetData>> {
        if (minDate == null) throw new Error('Invalid params: minDate');
        if (maxDate == null) throw new Error('Invalid params: maxDate');
        if (rate == null) throw new Error('Invalid params: rate');

        const assetData: AssetHistData<AssetData> = {
            key: assetCode ?? AssetType.FixedRate,
            type: AssetType.FixedRate,
            granularity: DataGranularity.Day,
            metadata: {
                errors: [],
                minDate,
                maxDate,
            },
            data: [],
        };

        assetData.data = generateFixedRate(AssetType.FixedRate, minDate, maxDate, initValue, rate);

        return assetData;
    }
}
