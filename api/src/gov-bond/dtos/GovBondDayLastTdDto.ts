export interface GovBondDayLastTdDto {
    responseStatus: number;
    responseStatusText: string;
    statusInfo: string;
    response: {
        BdTxTp: {
            cd: number;
        };
        TrsrBondMkt: {
            opngDtTm: string;
            clsgDtTm: string;
            qtnDtTm: string; // Horário última atualizalção
            sts: string; // Estado do mercado (e.g. "Em manutenção")
            stsCd: string; // 3 - "Em manutenção"
        };
        TrsrBdTradgList: GovBondDayLastTdAssetDto[]
    }
}

export interface GovBondDayLastTdAssetDto {
    TrsrBd: {
        cd: number;
        nm: string; // Nome do ativo
        mtrtyDt: string; // Vencimento
        isinCd: string; // ISIN: BRSTNCLF1R41
        featrs: string; // Descrição
        invstmtStbl: string; // Descrição 2
        rcvgIncm: string; // Descrição 3
        semiAnulIntrstInd: boolean; // Juros Semestrais
        untrInvstmtVal: number; // PU Compra
        untrRedVal: number; // PU Venda
        anulInvstmtRate: number; // Rentabilidade Anual Compra
        anulRedRate: number; // Rentabilidade Anual Venda
        minRedQty: number; // Quantidade Mínima Venda
        minRedVal: number; // Valor Mínimo Venda?
        minInvstmtAmt: number; // Valor Mínimo Compra
        FinIndxs: {
            cd: number;
            nm: string; // Indexador
        };
        wdwlDt: string; // Alguma Data?

    }
}

// amortQuotQty: 0
// anulInvstmtRate: 0
// anulRedRate: 0.01
// BusSegmt: null
// cd: 171
// convDt: null
// featrs: 'Título com rentabilidade diária vinculada à taxa de juros da economia (taxa Selic). Isso significa que se a taxa Selic aumentar a sua rentabilidade aumenta e se a taxa Selic diminuir, sua rentabilidade diminui.\r\n'
// FinIndxs: {cd: 17, nm: 'SELIC'}
// invstmtStbl: 'Como não paga juros semestrais, é mais interessante para quem pode deixar o dinheiro render até o vencimento do investimento\r\n'
// isinCd: 'BRSTNCLF0008'
// minInvstmtAmt: 0
// minRedQty: 0.01
// minRedVal: 138.55
// mtrtyDt: '2024-09-01T00:00:00'
// nm: 'Tesouro Selic 2024'
// rcvgIncm: 'Indicado para aqueles que querem realizar investimentos de curto prazo\r\n'
// semiAnulIntrstInd: false
// untrInvstmtVal: 0
// untrRedVal: 13854.84
// wdwlDt: null

// BondLastPositionData.response.TrsrBd.[].nm

// Tesouro Selic 2021
// Tesouro Selic 2023
// Tesouro Selic 2024
// Tesouro Selic 2025
// Tesouro Selic 2027
// Tesouro Prefixado 2022
// Tesouro Prefixado 2023
// Tesouro Prefixado com Juros Semestrais 2023
// Tesouro Prefixado 2024
// Tesouro Prefixado 2025
// Tesouro Prefixado com Juros Semestrais 2025
// Tesouro Prefixado 2026
// Tesouro Prefixado com Juros Semestrais 2027
// Tesouro Prefixado com Juros Semestrais 2029
// Tesouro Prefixado com Juros Semestrais 2031
// Tesouro IPCA+ 2024
// Tesouro IPCA+ com Juros Semestrais 2024
// Tesouro IPCA+ 2026
// Tesouro IPCA+ com Juros Semestrais 2026
// Tesouro IPCA+ com Juros Semestrais 2030
// Tesouro IPCA+ 2035
// Tesouro IPCA+ com Juros Semestrais 2035
// Tesouro IPCA+ com Juros Semestrais 2040
// Tesouro IPCA+ 2045
// Tesouro IPCA+ com Juros Semestrais 2045
// Tesouro IPCA+ com Juros Semestrais 2050
// Tesouro IPCA+ com Juros Semestrais 2055
// Tesouro IGPM+ com Juros Semestrais 2021
// Tesouro IGPM+ com Juros Semestrais 2031

// BondLastPositionData.response.TrsrBd.[].FinIndxs.nm

// SELIC
// PREFIXADO
// IPCA
// IGP-M