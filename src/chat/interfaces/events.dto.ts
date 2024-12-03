import { IsString, IsInt, IsIn } from 'class-validator';

export class PrivateMessageDto {
  @IsString()
  content: string;

  @IsInt()
  from: number;

  @IsInt()
  to: number;
}
