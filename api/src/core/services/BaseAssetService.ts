import { DataSource } from '@/core/enums/DataSource';
import { AssetData } from '@/core/models/AssetData';
import { AssetHistData } from '@/core/models/AssetHistData';
import { Logger } from '@nestjs/common';

export abstract class BaseAssetService {
  protected logger: Logger;

  constructor(type: DataSource) {
    this.logger = new Logger(type);
  }

  public abstract getData(params: GetDataParams): Promise<AssetHistData<AssetData>>;
}

export interface GetDataParams {
  assetCode?: string;
  minDate?: Date;
  maxDate?: Date;
  rate?: number;
}
