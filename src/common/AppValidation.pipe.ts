import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe,
} from '@nestjs/common';
import { LanguageService } from './language/language.service';

@Injectable()
export class AppValidationPipe implements PipeTransform {
  private validationPipe: ValidationPipe;

  constructor(private readonly langProvider: LanguageService) {
    this.validationPipe = new ValidationPipe({
      exceptionFactory: (errors) => {
        let constraint: string;
        let msg: string | undefined;
        const result = errors.reduce((errorMap, error) => {
          constraint = Object.keys(error.constraints)[0];
          msg = this.langProvider.language.validation[constraint];
          errorMap[error.property] =
            msg ||
            this.langProvider.language.validation.getDefault(error.property);
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
