import { INestApplication, Logger, Type } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { tmpdir } from 'os';
import * as path from 'path';
const pkg = require(path.join(process.cwd(), 'package.json'));

export type DynamicConfigs = Record<string, any>;

export class AppService {
    static logger: Logger;

    private static app: INestApplication;
    static appId = pkg.name;
    static appCacheDir = path.join(tmpdir(), `/${this.appId}`);

    private static envFile = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`);

    private static info: string[] = [];

    static async init() {
        this.addInfo(`
            appId: ${this.appId}
            appCacheDir: ${this.appCacheDir}
            cwd: ${process.cwd()}
            execPath: ${process.execPath}
            argv: ${process.argv.join()}
            dirname: ${__dirname}
            filename: ${__filename}
            envFile: ${this.envFile}`.replace(/^\s+/mg, ''));

        if (this.envFile) dotenv.configDotenv({ path: this.envFile, override: true });

        this.addInfo(`NODE_ENV: ${process.env.NODE_ENV}`);
    }

    static async register(app: INestApplication) {
        this.app = app;
        this.logger = new Logger(AppService.name);
    }

    // Services

    static getService<T>(service: Type<T>): T {
        return this.app.get<T>(service);
    }

    // Info

    static addInfo(info: string) {
        // console.log(`> ${info}`);
        this.info.push(info);
    }

    static getInfo() {
        return `\n\n--- APP INFO ---\n${this.info.join('\n')}\n`;
    }

    static logInfo() {
        const info = this.getInfo();
        this.logger.log(info)
    }
}
