import { IsInt, IsPositive } from "class-validator";

export class PaginationDto {
  @IsInt()
  page: number;

  @IsInt()
  @IsPositive()
  count: number;
}
