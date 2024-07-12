import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator'

export function IsNonEmptyString (validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsNonEmptyString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate (value: any) {
          return (value instanceof String || typeof value === 'string') && (value !== '' && value !== null && value !== undefined);
        },
        defaultMessage (validationArguments: ValidationArguments) {
          return `${validationArguments.property} must be a non-empty string.`;
        },
      },
    });
  }
}