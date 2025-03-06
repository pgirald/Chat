import {
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EntitiesPaginationDto, PaginationDto } from '../../common/crud/paginationDto';
import { IsContactsFilter } from '../validators/isContactFilter';

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
