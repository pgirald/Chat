import { IsString, IsInt } from 'class-validator';

export class PrivateMessageDto {
  @IsString()
  content: string;

  @IsString()
  from: string;

  @IsString()
  to: string;
}