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
import { PaginationDto } from '../common/crud/paginationDto';
import { IsContactsFilter } from './isContactFilter';
import { Type } from 'class-transformer';

export class ContactsPaginationDto {
  @IsOptional()
  @IsContactsFilter()
  filter?: string;

  @ValidateNested()
  @Type(() => PaginationDto)
  paginationInfo: PaginationDto;
}
