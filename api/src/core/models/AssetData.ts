import { ApiProperty } from '@nestjs/swagger';

export class AssetData {
  @ApiProperty()
  assetCode: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  value: number;

  @ApiProperty()
  currency?: string;
}