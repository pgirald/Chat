import { IsInt, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { IsUnderPageLimit } from './isUnderPageLimit';
import { IsAlwaysWrong } from '../../../test/src/common/validators/isAlwaysWrong';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsInt()
  page: number;

  @IsInt()
  @IsPositive()
  @IsUnderPageLimit()
  count: number;
}

export interface EntitiesPaginationDto<F> {
  filter: F;

  paginationInfo: PaginationDto;
}
