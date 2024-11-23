import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe,
} from '@nestjs/common';

@Injectable()
export class AppValidationPipe implements PipeTransform {
  private validationPipe: ValidationPipe;

  constructor() {
    this.validationPipe = new ValidationPipe({
      exceptionFactory: (errors) => {
        
        const result = errors.reduce((errorMap, error) => {
          errorMap[error.property] =
            error.constraints[Object.keys(error.constraints)[0]];
          return errorMap;
        }, {});
        return new BadRequestException(result);
      },
      stopAtFirstError: true,
    });
  }

  transform(value: any, metadata: ArgumentMetadata) {
    return this.validationPipe.transform(value, metadata);
  }
}
