import { DataSource } from '@/core/enums/DataSource';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { BaseAssetSgsService } from '@/core/services/BaseAssetSgsService';
import { IpcaData } from '@/ipca/models/IpcaData';
import { Injectable, Scope } from '@nestjs/common';

// Monthly data from 1980-01-01 to ~M-1.5

@Injectable({ scope: Scope.DEFAULT })
export class IpcaMonthSgsService extends BaseAssetSgsService<IpcaData> {
    constructor() {
        super(DataSource.SelicDaySgs, AssetType.IPCA, DataGranularity.Month, '433');
    }
}