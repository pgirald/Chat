import { Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Models, MODELS } from '../../persistence/constants';

export const IS_NEW_EMAIL = 'isNewEmail';

@Injectable()
@ValidatorConstraint({ name: IS_NEW_EMAIL, async: true })
export class IsNewEmailConstraint implements ValidatorConstraintInterface {
  constructor(@Inject(MODELS) private models: Models) {}

  async validate(email: any, args: ValidationArguments) {
    if (typeof email !== 'string') {
      return false;
    }

    const user = await this.models.Clients.findOne({ where: { email: email } });

    if (user) {
      return false;
    }

    return true;
  }
}

export function IsNewEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNewEmailConstraint,
    });
  };
}
