import {
  isAlphanumeric,
  isEmail,
  matches,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CHAT_NAME_REGEX } from '../../persistence/constants';

export const IS_CHAT_NAME = 'isChatName';

@ValidatorConstraint({ name: IS_CHAT_NAME })
export class IsChatNameConstraint implements ValidatorConstraintInterface {
  async validate(chatName: any, args: ValidationArguments) {
    return typeof chatName === 'string' && matches(chatName, CHAT_NAME_REGEX);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `The given chat name is invalid.`;
  }
}

export function IsChatName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsChatNameConstraint,
    });
  };
}
