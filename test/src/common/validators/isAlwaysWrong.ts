import { Inject, Injectable } from '@nestjs/common';
import {
  matches,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const IS_ALWAYS_WRONG = 'isAlwaysWrong';

@ValidatorConstraint({ name: IS_ALWAYS_WRONG })
export class IsAlwaysWrongConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    return false;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `No matter what, the propety's value is wrong.`;
  }
}

export function IsAlwaysWrong(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAlwaysWrongConstraint,
    });
  };
}
