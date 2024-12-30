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
import { isUsername } from '../auth/validators/isUsername';

export const IS_CONTACTS_FILTER = 'isContactsFilter';

@ValidatorConstraint({ name: IS_CONTACTS_FILTER })
export class IsContactsFilterConstraint
  implements ValidatorConstraintInterface
{
  async validate(filter: any, args: ValidationArguments) {
    return (
      typeof filter === 'string' &&
      (matches(filter, /^([_.-]?[A-Za-z0-9])*$/) || isEmail(filter))
    );
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `The given filter is not an username or an email.`;
  }
}

export function IsContactsFilter(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsContactsFilterConstraint,
    });
  };
}
