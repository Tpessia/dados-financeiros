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

    async getData(params: GetDataParams): Promise<AssetHistData<AssetData>> {
        this.validateParams(params, ['minDate','maxDate','rate']);

        const assetData: AssetHistData<AssetData> = {
            key: params.assetCode ?? AssetType.FixedRate,
            type: AssetType.FixedRate,
            granularity: DataGranularity.Day,
            metadata: {
                errors: [],
                minDate: params.minDate,
                maxDate: params.maxDate,
            },
            data: [],
        };

        assetData.data = generateFixedRate(AssetType.FixedRate, params.minDate, params.maxDate, initValue, params.rate);

        return assetData;
    }
}
