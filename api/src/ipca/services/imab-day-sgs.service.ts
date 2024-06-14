import { DataSource } from '@/core/enums/DataSource';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { BaseAssetSgsService } from '@/core/services/BaseAssetSgsService';
import { IpcaData } from '@/ipca/models/IpcaData';
import { Injectable, Scope } from '@nestjs/common';

// Daily data from 2004-04-30 to 2023-05-22

@Injectable({ scope: Scope.DEFAULT })
export class ImabDaySgsService extends BaseAssetSgsService<IpcaData> {
    constructor() {
        super(DataSource.SelicDaySgs, AssetType.IMAB, DataGranularity.Day, '12466');
    }
}