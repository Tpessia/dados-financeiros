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

  protected validateParams(params: GetDataParams, validate: (keyof GetDataParams)[]): void {
    if (validate.includes('assetCode') && params.assetCode == null) throw new Error('Invalid params: assetCode');
    if (validate.includes('minDate') && params.minDate == null) throw new Error('Invalid params: minDate');
    if (validate.includes('maxDate') && params.maxDate == null) throw new Error('Invalid params: maxDate');
    if (validate.includes('rate') && params.rate == null) throw new Error('Invalid params: rate');
    if (validate.includes('minDate') && validate.includes('maxDate') && params.minDate > params.maxDate) throw new Error('Invalid params: minDate > maxDate');
  }
}

export interface GetDataParams {
  assetCode?: string;
  minDate?: Date;
  maxDate?: Date;
  rate?: number;
}
