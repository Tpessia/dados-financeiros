import { castPercent, normalizeTimezone, parseMoment, promiseRetry } from '@/@utils';
import { DataSource } from '@/core/enums/DataSource';
import { AssetHistData } from '@/core/models/AssetHistData';
import { AssetType } from '@/core/models/AssetType';
import { DataGranularity } from '@/core/models/DataGranularity';
import { BaseAssetService, GetDataParams } from '@/core/services/BaseAssetService';
import { HttpService } from '@/core/services/http.service';
import { IpcaMonthIpeaDto } from '@/ipca/dtos/IpcaMonthIpeaDto';
import { IpcaData } from '@/ipca/models/IpcaData';
import { Injectable, Scope } from '@nestjs/common';
import { sortBy } from 'lodash';

// Monthly data from 1980-01-01 to ~M-1.5

@Injectable({ scope: Scope.DEFAULT })
export class IpcaMonthIpeaService extends BaseAssetService {
    private jsonUrl = "http://ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='PAN12_IPCAG12')";

    constructor() {
        super(DataSource.IpcaMonthIpea);
    }

    async getData({ assetCode, minDate, maxDate }: GetDataParams): Promise<AssetHistData<IpcaData>> {
        if (minDate == null) throw new Error('Invalid params: minDate');
        if (maxDate == null) throw new Error('Invalid params: maxDate');

        const assetData: AssetHistData<IpcaData> = {
            key: assetCode ?? AssetType.IPCA,
            type: AssetType.IPCA,
            granularity: DataGranularity.Month,
            metadata: {
                errors: [],
                minDate,
                maxDate,
            },
            data: [],
        };

        const dto = await this.getDto();

        // Map

        for (let data of dto) {
            let date = parseMoment(normalizeTimezone(new Date(data.VALDATA)));
            date = date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            const value = +(Math.pow(1 + castPercent(data.VALVALOR), 1/12) - 1).toFixed(4);

            const parsed: IpcaData = { assetCode: AssetType.IPCA, date: date.toDate(), value, currency: 'BRL' };

            assetData.data.push(parsed);
        }

        assetData.data = assetData.data.filter(e => e.date >= minDate);
        assetData.data = assetData.data.filter(e => maxDate >= e.date);

        assetData.data = sortBy(assetData.data, e => e.date);

        return assetData;
    }

    // @Memoize({ cacheType: MemoizeCacheType.Storage })
    async getDto(): Promise<IpcaMonthIpeaDto[]> {
        const data = await promiseRetry(
            () => HttpService.get<{ value: IpcaMonthIpeaDto[] }>(this.jsonUrl).then(r => r.data?.value),
            3,
            err => this.logger.log(`Retry Error: ${err}`)
        );

        return data;
    }
}
