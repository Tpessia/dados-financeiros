import xlsx from 'xlsx';

export interface GovBondDaySiswebDto {
    year?: string;
    code?: string;
    url?: string;
    file?: Buffer;
    workBook?: xlsx.WorkBook;
    workSheets?: xlsx.WorkSheet[];
    rawJson?: Record<string, any[][]>;
}