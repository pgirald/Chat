import {
  isAlphanumeric,
  isEmail,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const IS_CONTACTS_FILTER = 'isContactsFilter';

@ValidatorConstraint({ name: IS_CONTACTS_FILTER })
export class IsContactsFilterConstraint implements ValidatorConstraintInterface {
  async validate(filter: any, args: ValidationArguments) {
    return (
      typeof filter === 'string' && (isAlphanumeric(filter) || isEmail(filter))
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
      validator: IsContactsFilter,
    });
  };
}
