import { DataSource } from '@/core/enums/DataSource';
import { AssetHistData } from '@/core/models/AssetHistData';
import { DataGranularity } from '@/core/models/DataGranularity';
import { dailyfyPercents } from '@/core/services/AssetTransformers';
import { BaseAssetService, GetDataParams } from '@/core/services/BaseAssetService';
import { IpcaData } from '@/ipca/models/IpcaData';
import { IpcaMonthSgsService } from '@/ipca/services/ipca-month-sgs.service';
import { Injectable, Scope } from '@nestjs/common';

// Daily data from 1980-01-01 to ~M-1.5

@Injectable({ scope: Scope.DEFAULT })
export class IpcaDaySgsService extends BaseAssetService {
    constructor(private ipcaMonthSgsService: IpcaMonthSgsService) {
        super(DataSource.IpcaDaySgs);
    }

    async getData({ assetCode, minDate, maxDate }: GetDataParams): Promise<AssetHistData<IpcaData>> {
        const monthlyData = await this.ipcaMonthSgsService.getData({ assetCode, minDate, maxDate });
        const dailyData = dailyfyPercents(monthlyData.data, maxDate);
        return {
            ...monthlyData,
            data: dailyData,
            granularity: DataGranularity.Day,
        };
    }
}
