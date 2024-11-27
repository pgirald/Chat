import { Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Models, MODELS } from '../../persistence/constants';

const IS_NEW_USERNAME = 'isNewUsername';

@Injectable()
@ValidatorConstraint({ name: IS_NEW_USERNAME, async: true })
export class IsNewUsernameConstraint implements ValidatorConstraintInterface {
  constructor(@Inject(MODELS) private models: Models) {}

  async validate(username: any, args: ValidationArguments) {
    if (typeof username !== 'string') {
      return false;
    }

    const user = await this.models.Clients.findOne({
      where: { username: username },
    });

    if (user) {
      return false;
    }

    return true;
  }
}

export function IsNewUsername(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNewUsernameConstraint,
    });
  };
}
