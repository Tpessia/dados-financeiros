import xlsx from 'xlsx';

export interface GovBondDayTransparenteDto {
    file?: Buffer;
    workBook?: xlsx.WorkBook;
    workSheets?: xlsx.WorkSheet[];
    rawJson?: any[][];
}

// 'Tipo Titulo': 'Tesouro IPCA+ com Juros Semestrais'
// 'Data Vencimento': '15/08/2020'
// 'Data Base': '15/08/2020'
// 'Taxa Compra Manha': '6,49'
// 'Taxa Venda Manha': '6,49'
// 'PU Compra Manha': '6,49'
// 'PU Venda Manha': '6,49'
// 'PU Base Manha': '6,49'