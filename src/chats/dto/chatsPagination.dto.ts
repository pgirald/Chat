import { IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  EntitiesPaginationDto,
  PaginationDto,
} from '../../common/crud/paginationDto';
import { IsChatName } from '../validators/isChatName';

export class ChatsPaginationDto
  implements EntitiesPaginationDto<string | undefined>
{
  @IsOptional()
  @IsChatName()
  filter: string | undefined;

  @IsOptional()
  @IsInt()
  @Min(0)
  msgsPerPage?: number;

  @ValidateNested()
  @Type(() => PaginationDto)
  paginationInfo: PaginationDto;
}
