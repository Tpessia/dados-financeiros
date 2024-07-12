import { DataSource } from '@/core/enums/DataSource';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { BaseAssetSgsService } from '@/core/services/BaseAssetSgsService';
import { SelicData } from '@/selic/models/SelicData';
import { Injectable, Scope } from '@nestjs/common';

// Daily data from 1986-06-04 to ~D-1

@Injectable({ scope: Scope.DEFAULT })
export class SelicDaySgsService extends BaseAssetSgsService<SelicData> {
    constructor() {
        super(DataSource.SelicDaySgs, AssetType.Selic, DataGranularity.Day, '11');
    }
}