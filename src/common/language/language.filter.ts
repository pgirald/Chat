import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LanguageService } from './language.service';
import { Response } from 'express';

@Catch()
export class LanguageFilter implements ExceptionFilter {
  constructor(private readonly langProvider: LanguageService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let e: HttpException;

    if (exception instanceof HttpException) {
      e = exception;
    } else {
      e = new InternalServerErrorException(e);
    }

    const status = e.getStatus();

    const message =
      this.langProvider.language.status[status] ||
      this.langProvider.language.status.unknown;

    response.status(status).json({
      detail: e.getResponse(),
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
