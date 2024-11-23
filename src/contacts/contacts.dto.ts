import {
  isAlphanumeric,
  isEmail,
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsStrongPassword,
  Matches,
  Validate,
  ValidateIf,
} from 'class-validator';
import { ValidateThat } from '../utils/class_validator';
import { Client } from '../persistence/Entities';
import { isRegExp } from 'util/types';

export class PaginationDto {
  @IsInt()
  page: number;

  @IsInt()
  @IsPositive()
  count: number;

  @ValidateThat(
    (value) =>
      !value ||
      (typeof value === 'string' && (isAlphanumeric(value) || isEmail(value))),
    {
      message: 'The value must be either an email or an alphanumeric',
    },
  )
  filter?: string;
}
