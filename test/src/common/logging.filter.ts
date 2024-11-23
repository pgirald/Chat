import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class LoggingFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.log(
      '----------------------------------EXCEPTION----------------------------------',
    );
    console.log(exception);
    console.log(
      '-----------------------------------------------------------------------------',
    );
    super.catch(exception, host);
  }
}
