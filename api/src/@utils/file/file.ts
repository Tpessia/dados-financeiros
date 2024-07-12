import * as fs from 'fs';
import * as path from 'path';

export function writeFileSync(filePath: string, data: string | Buffer) {
    const dir = filePath.split('/').slice(0, -1).join('/');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, data);
}

export function writeFileAsync(filePath: string, data: string | Buffer) {
    return new Promise<void>((res, rej) => {
        try {
            const dir = path.dirname(filePath);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFile(filePath, data, err => {
                if (err) rej(err);
                else res();
            });
        } catch (err) {
            rej(err);
        }
    });
}

export function readFileSync(filePath: string) {
    return fs.readFileSync(filePath, { encoding: 'utf-8' });
}

export function readFileAsync(filePath: string) {
    return new Promise<string>((res, rej) => {
        try {
            fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
                if (err) rej(err);
                else res(data);
            });
        } catch (err) {
            rej(err);
        }
    });
}

export function readFileBufferSync(filePath: string) {
    return fs.readFileSync(filePath);
}

export function readFileBufferAsync(filePath: string) {
    return new Promise<Buffer>((res, rej) => {
        try {
            fs.readFile(filePath, (err, data) => {
                if (err) rej(err);
                else res(data);
            });
        } catch (err) {
            rej(err);
        }
    });
}

export function fileToBinary(file: Blob): Promise<string> {
    return new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = () => res(reader.result as any);
        reader.onerror = err => rej(err);
    });
}

export function fileToBase64(file: Blob): Promise<string> {
    return new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => res((reader.result as any).split(',').pop());
        reader.onerror = err => rej(err);
    });
}

export function base64ToFile(base64: string, fileName: string, mimeType: string = 'application/octet-stream'): Promise<File> {
    const url = `data:${mimeType};base64,${base64}`;
    return fetch(url)
        .then(r => r.arrayBuffer())
        .then(r => new File([r], fileName, { type: mimeType }));
}

export async function fetchToFile(response: Response): Promise<File> {
    const file = await response.blob();
    const mimeType = response.headers.get('Content-Type') || 'application/octet-stream';
    let fileName = 'file';

    const fileDataHeader = response.headers.get('Content-Disposition');
    if (fileDataHeader) {
        const fileDataArr = fileDataHeader.split(';').map(e => e.trim().split('='));
        const fileData = fileDataArr.reduce((acc, val) => ({ ...acc, [val[0]]: val[1] }), {} as { filename?: string })
        if (fileData.filename) fileName = fileData.filename;
    }

    return new File([file], fileName, { type: mimeType })
}

export function downloadMemoryFile(file: Blob, fileName: string) {
    const elem = document.createElement('a');

    elem.href = window.URL.createObjectURL(file);
    elem.download = fileName;

    document.body.appendChild(elem); // required for Firefox

    elem.click();
    elem.remove();
}

export async function downloadBase64File(base64: string, fileName: string) {
    const file = await base64ToFile(base64, fileName);
    downloadMemoryFile(file, fileName);
}

export function downloadLocalFile(filePath: string, fileName: string) {
    const basePath = '/';
    const fullPath = basePath + filePath;

    const elem = document.createElement('a');

    elem.href = fullPath;
    elem.download = fileName;

    document.body.appendChild(elem); // required for Firefox

    elem.click();
    elem.remove();
}

export async function downloadFetchFile(response: Response) {
    const file = await fetchToFile(response);
    downloadMemoryFile(file, file.name);
}