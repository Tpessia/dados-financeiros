import { AssetData } from '@/core/models/AssetData';

export class StockData extends AssetData {
    volume: number;
    open: number;
    high: number;
    low: number;
    close: number;
    adjRatio: number;
    adjOpen: number;
    adjHigh: number;
    adjLow: number;
    adjClose: number;
    dividendAmount?: number;
    splitCoefficient?: number;
}
