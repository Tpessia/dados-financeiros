import { ConfigService } from '@/core/services/config.service';
import { ConsoleLogger, LogLevel } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export class FileLogger extends ConsoleLogger {
    logger: winston.Logger;
    logDir = ConfigService.appDataDir;

    constructor(logLevels: LogLevel[]) {
        super();

        ConfigService.addInfo(`Logging to: ${this.logDir}`);

        this.setLogLevels(logLevels);

        const transport = new winston.transports.DailyRotateFile({
            filename: 'log-%DATE%.log',
            dirname: this.logDir,
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '5d'
        });

        this.logger = winston.createLogger({
            exitOnError: false,
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`+(info.splat!==undefined?`${info.splat}`:" "))
                // winston.format.simple()
            ),
            transports: [transport]
        });

        // if (process.env.NODE_ENV !== 'prod')
        //     winston.add(new winston.transports.File({
        //         filename: 'path/to/combined.log',
        //         handleExceptions: true
        //     }));
    }

    log(message: any, ...optionalParams: [...any, string?]) {
        const [msg, context] = this.extractMessage(message, ...optionalParams);

        try {
            this.logger.log('info', `[${context}] ${msg}`);
        } catch (err) {
            super.log(msg, context);
        }

        super.log(msg, context);
    }

    error(message: any, stack?: string, ...optionalParams: [...any, string?]) {
        const [msg, context] = this.extractMessage(message, ...optionalParams);

        try {
            this.logger.log('error', `[${context}] ${msg}\n${stack}`);
        } catch (err) {
            super.error(msg, stack, context);
        }

        super.error(msg, stack, context);
    }

    private extractMessage(message: string, ...optionalParams: [...any, string?]) {
        let rest: string = '';
        let context: string | undefined;

        if (typeof optionalParams?.[0] === 'string') {
            context = optionalParams?.[0] || this.context;
        } else {
            rest = optionalParams?.[0] ? ' ' + optionalParams?.[0]?.join(' ') : '';
            context = optionalParams?.[1] || this.context;
        }

        message = message + rest;

        return [message, context];
    }
}