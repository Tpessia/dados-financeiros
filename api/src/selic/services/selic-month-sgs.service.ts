import { DataSource } from '@/core/enums/DataSource';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { BaseAssetSgsService } from '@/core/services/BaseAssetSgsService';
import { SelicData } from '@/selic/models/SelicData';
import { Injectable, Scope } from '@nestjs/common';

// Monthly data from 1986-06-01 to ~M0

@Injectable({ scope: Scope.DEFAULT })
export class SelicMonthSgsService extends BaseAssetSgsService<SelicData> {
    constructor() {
        super(DataSource.SelicMonthSgs, AssetType.Selic, DataGranularity.Month, '4390');
    }
}