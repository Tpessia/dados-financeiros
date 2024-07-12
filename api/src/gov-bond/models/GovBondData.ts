import { AssetData } from '@/core/models/AssetData';

export class GovBondData extends AssetData {
    assetType: GovBondType;
    maturityDate: Date;
    buyRate: number;
    sellRate: number;
    buyPu: number;
    sellPu: number;
    basePu?: number;
}

export enum GovBondType {
    LFT = 'LFT',
    LTN = 'LTN',
    NTN_F = 'NTN-F',
    NTN_B_P = 'NTN-B-P',
    NTN_B = 'NTN-B',
    NTN_C = 'NTN-C',
    NTN_R = 'NTN-R',
    NTN_E = 'NTN-E',
}
