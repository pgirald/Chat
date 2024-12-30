import {
  matches,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PAGE_LIMIT } from './constants';
import { Inject, Injectable } from '@nestjs/common';

export const IS_UNDER_PAGE_LIMIT = 'isUnderPageLimit';

@Injectable()
@ValidatorConstraint({ name: IS_UNDER_PAGE_LIMIT })
export class IsUnderPageLimitConstraint
  implements ValidatorConstraintInterface
{
  constructor(@Inject(PAGE_LIMIT) private readonly pageLimit: number) {}

  async validate(num: number, args: ValidationArguments) {
    return num <= this.pageLimit;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `The requested page size is not under ${PAGE_LIMIT}.`;
  }
}

export function IsUnderPageLimit(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUnderPageLimitConstraint,
    });
  };
}
