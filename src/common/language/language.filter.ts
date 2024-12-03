import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { LanguageService } from './language.service';
import { Response } from 'express';

@Catch(HttpException)
export class LanguageFilter implements ExceptionFilter {
  constructor(private readonly langProvider: LanguageService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();

    const message =
      this.langProvider.language.status[status] ||
      this.langProvider.language.status.unknown;

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
