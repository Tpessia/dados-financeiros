import { AssetData } from '@/core/models/AssetData';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { ApiProperty } from '@nestjs/swagger';

export class AssetHistData<T extends AssetData> {
  @ApiProperty()
  key: string;

  @ApiProperty()
  type: AssetType;

  @ApiProperty()
  granularity: DataGranularity;

  @ApiProperty()
  metadata: any;

  @ApiProperty({ type: AssetData, isArray: true })
  data: T[];
}
