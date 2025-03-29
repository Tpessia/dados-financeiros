import { tryStringifyCircularJson } from '@/@utils';
import { responseWrapper } from '@/core/models/ResponseWrapper';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import axios from 'axios';
import { Request, Response } from 'express';

export class ErrorResponse {
    @ApiProperty()
    statusCode: number;

    @ApiProperty()
    error: string;

    @ApiProperty()
    stack?: string;
}

@Catch()
export default class ErrorFilter implements ExceptionFilter<any> {
    private logger = new Logger(ErrorFilter.name);

    catch(err: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = err instanceof HttpException
            ? err.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR
            : axios.isAxiosError(err)
            ? err?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const errMsg = axios.isAxiosError(err)
            ? tryStringifyCircularJson(err?.response?.data) || err.toString()
            : err.message;

        const errorMsg: ErrorResponse = { statusCode: status, error: errMsg };
        const logError = `${errMsg}\n@ ${request.url}`;

        if (status === 500) {
            errorMsg.stack = err.stack;
            this.logger.error(logError, err.stack);
        } else {
            this.logger.error(logError);
        }

        response.status(status).json(responseWrapper(errorMsg));
    }
}