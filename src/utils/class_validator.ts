import {
  validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

export function ValidateThat(
  predicate: (value) => boolean,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Check if the value is either a valid email or an alphanumeric string
          return predicate(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'The given value is invalid';
        },
      },
    });
  };
}
