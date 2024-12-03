import { Inject, Injectable } from '@nestjs/common';
import {
  matches,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Models, MODELS } from '../../persistence/constants';

export const IS_USERNAME = 'isUsername';

@ValidatorConstraint({ name: IS_USERNAME })
export class IsUsernameConstraint implements ValidatorConstraintInterface {
  async validate(username: string, args: ValidationArguments) {
    return matches(username, /^[A-Za-z]([_.-]?[A-Za-z0-9]){7,29}$/);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `The given username has an incorrect format`;
  }
}

export function IsUsername(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameConstraint,
    });
  };
}
