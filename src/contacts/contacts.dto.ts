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
import {
  EntitiesPaginationDto,
  PaginationDto,
} from '../common/crud/paginationDto';
import { IsContactsFilter } from './isContactFilter';
import { Type } from 'class-transformer';

export class ContactsPaginationDto
  implements EntitiesPaginationDto<string | undefined>
{
  @IsOptional()
  @IsContactsFilter()
  filter: string | undefined;

  @ValidateNested()
  @Type(() => PaginationDto)
  paginationInfo: PaginationDto;
}
