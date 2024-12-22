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
  ValidateNested,
} from 'class-validator';
import { Client } from '../persistence/Entities';
import { isRegExp } from 'util/types';
import { PaginationDto } from '../common/crud/paginationDto';
import { IsContactsFilter } from './isContactFilter';

export class ContactsPaginationDto {
  @ValidateNested()
  paginationInfo: PaginationDto;

  @IsContactsFilter()
  filter?: string;
}
