import { promiseParallel } from '@/@utils';
import { AssetData } from '@/core/models/AssetData';
import { AssetHistData } from '@/core/models/AssetHistData';
import { AssetType } from '@/core/models/AssetType';
import { applyLeverage, assetfy, cleanUpData, convertCurrency, initAssetValue, sumAssets } from '@/core/services/AssetTransformers';
import { BaseAssetService, GetDataParams } from '@/core/services/BaseAssetService';
import { ConfigService } from '@/core/services/config.service';
import { FixedRateService } from '@/fixed-rate/services/fixed-rate.service';
import { GovBondType } from '@/gov-bond/models/GovBondData';
import { GovBondDayTransparenteService } from '@/gov-bond/services/gov-bond-day-transparente.service';
import { ImabDaySgsService } from '@/ipca/services/imab-day-sgs.service';
import { IpcaDaySgsService } from '@/ipca/services/ipca-day-sgs.service';
import { SelicDaySgsService } from '@/selic/services/selic-day-sgs.service';
import { StockYahooService } from '@/stock/services/stock-yahoo.service';
import { Injectable, Scope, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { groupBy, sortBy, uniq } from 'lodash';

interface AssetRule {
    name: string;
    assetType: AssetType;
    checkType: (assetCode: string) => boolean;
    service: Type;
    transformInputs?: (inputs: GetDataParams) => GetDataParams;
    transformData?: (data: AssetData[], rate: number) => AssetData[];
};

@Injectable({ scope: Scope.DEFAULT })
export class SearchService {
    private assetRules: AssetRule[] = [
        {
            name: AssetType.FixedRate,
            assetType: AssetType.FixedRate,
            checkType: (assetCode) => assetCode.startsWith('FIXED'), // FIXED*0.1
            service: FixedRateService,
        },
        {
            name: AssetType.Selic,
            assetType: AssetType.Selic,
            checkType: (assetCode) => assetCode.startsWith('SELIC.SA'),
            service: SelicDaySgsService,
            transformData: (data, rate) => applyLeverage(assetfy(data), rate),
        },
        {
            name: AssetType.IPCA,
            assetType: AssetType.IPCA,
            checkType: (assetCode) => assetCode.startsWith('IPCA.SA'),
            service: IpcaDaySgsService,
            transformData: (data, rate) => applyLeverage(assetfy(data), rate),
        },
        {
            name: AssetType.IMAB,
            assetType: AssetType.IMAB,
            checkType: (assetCode) => assetCode.startsWith('IMAB.SA'),
            service: ImabDaySgsService,
            transformData: (data, rate) => applyLeverage(data, rate),
        },
        {
            name: AssetType.GovBond,
            assetType: AssetType.GovBond,
            checkType: (assetCode) => new RegExp(`^(${Object.values(GovBondType).join('|')})/\\d{4}\\.SA`).test(assetCode), // LTN/2021.SA
            service: GovBondDayTransparenteService,
            transformInputs: ({ assetCode, ...inputs }) => ({ assetCode: assetCode.replace('.SA', ''), ...inputs }),
            transformData: (data, rate) => applyLeverage(data, rate),
        },
        {
            name: AssetType.Forex,
            assetType: AssetType.Forex,
            checkType: (assetCode) => assetCode.endsWith('=X'), // USDBRL=X
            service: StockYahooService,
            transformData: (data, rate) => applyLeverage(data, rate),
        },
        {
            name: AssetType.IRX,
            assetType: AssetType.IRX,
            checkType: (assetCode) => assetCode.startsWith('IRX'),
            service: StockYahooService,
            transformInputs: ({ assetCode, ...inputs }) => ({ assetCode: '^IRX', ...inputs }),
            transformData: (data, rate) => applyLeverage(assetfy(data.map(e => ({ ...e, value: Math.pow(1 + e.value / 100, 1 / 252) - 1 }))), rate),
        },
        {
            name: AssetType.Stock,
            assetType: AssetType.Stock,
            checkType: (assetCode) => true,
            service: StockYahooService,
            transformData: (data, rate) => applyLeverage(data, rate),
        },
    ];

    constructor(
        private moduleRef: ModuleRef,
        private stockYahooService: StockYahooService,
    ) {}

    async getAssets(assetCodes: string, minDate: Date, maxDate: Date): Promise<AssetHistData<AssetData>[]> {
        minDate.setHours(0, 0, 0, 0);
        maxDate.setHours(23, 59, 59, 999);

        const cfg = ConfigService.config;

        const assets = uniq(assetCodes.split(cfg.assetsRegex)).map(a => ({ assetCode: a, rule: this.getAssetRule(a) }));
        if (assets.length > 10) throw new Error('Too many assets (max = 10)');

        const assetKeys = uniq(assetCodes.split(cfg.splitOp));
        const assetsByType = groupBy(assets, a => a.rule.name);

        const currencyRequests = new Map<string, Promise<AssetData[]>>();

        const tasks: (() => Promise<AssetHistData<AssetData>>)[] = Object.values(assetsByType).flatMap((assetRule) => {
            const rule = assetRule[0].rule;

            return assetsByType[rule.name].map((asset) => async () => {
                const service: BaseAssetService = await this.moduleRef.resolve(rule.service, undefined, { strict: false });

                let [_, code, currency, rate] = asset.assetCode.match(cfg.tickerRegex);

                if (code == null || (rate != null && isNaN(+rate)))
                    throw new Error(`Invalid asset code: ${asset.assetCode}`);

                if (rate == null) rate = '1';

                let inputs: GetDataParams = { assetCode: code, minDate, maxDate, rate: +rate };
                if (rule.transformInputs) inputs = rule.transformInputs(inputs);
                let data = await service.getData(inputs);
                if (rule.transformData) data.data = rule.transformData(data.data, +rate);

                if (currency != null) {
                    const assetCurrency = data.data[0]?.currency;
                    if (assetCurrency != null && assetCurrency !== currency) {
                        const currencyPair = `${assetCurrency}${currency}=X`;

                        if (!currencyRequests.has(currencyPair)) {
                            const currencyData = this.stockYahooService.getData({ assetCode: currencyPair, minDate, maxDate }).then(e => e.data);
                            currencyRequests.set(currencyPair, currencyData);
                        }

                        const currencyData = await currencyRequests.get(currencyPair);
                        data.data = convertCurrency(data.data, currencyData);
                        data.data.forEach(e => e.assetCode = `${code}:${currency}`);
                    } else {
                        data.data.forEach(e => { e.assetCode = `${code}:${currency}`; e.currency = currency; }); // For assets w/o base currency (e.g. FIXED)
                    }
                }

                data = cleanUpData(data);
                data.key = asset.assetCode;

                return data;
            });
        });

        const data = await promiseParallel(tasks, 5);

        const assetSumKeys = assetKeys.filter(e => e.match(cfg.sumRegex));
        assetSumKeys.forEach(key => data.push(sumAssets(key, ...data)));

        const sortedData = sortBy(data.filter(e => assetKeys.includes(e.key)), e => assetCodes.indexOf(e.data[0]?.assetCode));
        return sortedData;
    }

    private getAssetRule(assetCode: string): AssetRule {
        for (let rule of this.assetRules)
            if (rule.checkType(assetCode.toUpperCase()))
                return rule;
        throw new Error('Asset type not found');
    }
}
