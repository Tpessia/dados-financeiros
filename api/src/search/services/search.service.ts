import { promiseParallel } from '@/@utils';
import { AssetData } from '@/core/models/AssetData';
import { AssetHistData } from '@/core/models/AssetHistData';
import { AssetType } from '@/core/models/AssetType';
import { applyLeverage, assetfy, cleanUpData, convertCurrency, initValue } from '@/core/services/AssetTransformers';
import { BaseAssetService } from '@/core/services/BaseAssetService';
import { FixedRateService } from '@/fixed-rate/services/fixed-rate.service';
import { GovBondType } from '@/gov-bond/models/GovBondData';
import { GovBondDayTransparenteService } from '@/gov-bond/services/gov-bond-day-transparente.service';
import { ImabDaySgsService } from '@/ipca/services/imab-day-sgs.service';
import { IpcaDaySgsService } from '@/ipca/services/ipca-day-sgs.service';
import { SelicDaySgsService } from '@/selic/services/selic-day-sgs.service';
import { StockYahooService } from '@/stock/services/stock-yahoo.service';
import { Injectable, Scope, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { groupBy } from 'lodash';

interface AssetRule {
    name: string;
    assetType: AssetType;
    checkType: (assetCode: string) => boolean;
    service: Type;
    transform?: (data: AssetData[], rate: number) => AssetData[];
};

@Injectable({ scope: Scope.DEFAULT })
export class SearchService {
    private assetRules: AssetRule[] = [
        {
            name: AssetType.FixedRate,
            assetType: AssetType.FixedRate,
            checkType: (assetCode) => assetCode.startsWith('FIXED'),
            service: FixedRateService,
        },
        {
            name: AssetType.Selic,
            assetType: AssetType.Selic,
            checkType: (assetCode) => assetCode.startsWith('SELIC.SA'),
            service: SelicDaySgsService,
            transform: (data, rate) => applyLeverage(assetfy(data, initValue), rate),
        },
        {
            name: AssetType.IPCA,
            assetType: AssetType.IPCA,
            checkType: (assetCode) => assetCode.startsWith('IPCA.SA'),
            service: IpcaDaySgsService,
            transform: (data, rate) => applyLeverage(assetfy(data, initValue), rate),
        },
        {
            name: AssetType.IMAB,
            assetType: AssetType.IMAB,
            checkType: (assetCode) => assetCode.startsWith('IMAB.SA'),
            service: ImabDaySgsService,
            transform: (data, rate) => applyLeverage(data, rate),
        },
        {
            name: AssetType.GovBond,
            assetType: AssetType.GovBond,
            checkType: (assetCode) => Object.values(GovBondType).reduce((acc, val) => acc || assetCode.startsWith(`${val}.SA`), false),
            service: GovBondDayTransparenteService,
            transform: (data, rate) => applyLeverage(data, rate),
        },
        {
            name: AssetType.Forex,
            assetType: AssetType.Forex,
            checkType: (assetCode) => assetCode.endsWith('=X'),
            service: StockYahooService,
            transform: (data, rate) => applyLeverage(data, rate),
        },
        {
            name: AssetType.Stock,
            assetType: AssetType.Stock,
            checkType: (assetCode) => true,
            service: StockYahooService,
            transform: (data, rate) => applyLeverage(data, rate),
        },
    ];

    constructor(private moduleRef: ModuleRef) {}

    async getAssets(assetCodes: string, minDate: Date, maxDate: Date): Promise<AssetHistData<AssetData>[]> {
        const assets = assetCodes.split(',').map(a => ({ assetCode: a, rule: this.getAssetRule(a) }));
        const assetsByType = groupBy(assets, a => a.rule.name);

        const tasks: (() => Promise<AssetHistData<AssetData>>)[] = Object.values(assetsByType).flatMap((assetRule) => {
            const rule = assetRule[0].rule;

            return assetsByType[rule.name].map((asset) => async () => {
                const service: BaseAssetService = await this.moduleRef.resolve(rule.service, undefined, { strict: false });

                let [_, code, currency, rate] = asset.assetCode.match(/^([^\:\*]+)(?:\:(\w+))?(?:\*([\w\.]+))?/); // TSLA:USDBRL*1.5, USDBRL=X

                if (code == null || (rate != null && isNaN(+rate)))
                    throw new Error(`Invalid asset code: ${asset.assetCode}`);

                if (rate == null) rate = '1';

                const currencyData = getCurrencyData.call(this, currency);

                let data = await service.getData({ assetCode: code, minDate, maxDate, rate: +rate });
                if (rule.transform) data.data = rule.transform(data.data, +rate);

                if ((await currencyData) != null) {
                    data.data = convertCurrency(data.data, await currencyData);
                    data.data.forEach(e => e.assetCode = `${code}:${currency}`);
                }

                data.data = cleanUpData(data.data);
                data.key = asset.assetCode;

                return data;

                async function getCurrencyData(currency?: string) {
                    if (currency == null) return null;
                    const forexService = await this.moduleRef.resolve(StockYahooService, undefined, { strict: false });
                    const currencyData = await forexService.getData({ assetCode: `${currency}=X`, minDate, maxDate }).then(e => e.data);
                    return currencyData;
                }
            });
        });

        const data = await promiseParallel(tasks, 5);
        return data;
    }

    private getAssetRule(assetCode: string): AssetRule {
        for (let rule of this.assetRules)
            if (rule.checkType(assetCode.toUpperCase()))
                return rule;
        throw new Error('Asset type not found');
    }
}
