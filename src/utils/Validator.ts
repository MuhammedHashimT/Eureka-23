import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isFourCharactersWithNumbers', async: false })
export class IsFourCharactersWithNumbersConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    
    if (value.length !== 4) {
      return false;
    }

    const prefix = value.substring(0, 1);
    const suffix  = +value.substring(1);

    if (!isNaN(suffix) && Number(suffix) >= 100 && Number(suffix) <= 999) {
      return true;
    }

    return false;
  }
}

export function IsFourCharactersWithNumbers(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFourCharactersWithNumbersConstraint,
    });
  };
}
