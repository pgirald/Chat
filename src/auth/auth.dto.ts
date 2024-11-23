import {
  IsEmail,
  isEmail,
  IsOptional,
  IsStrongPassword,
  Matches,
  Validate,
  ValidateIf,
} from 'class-validator';
import {
  IsNewUsername,
  IsNewUsernameConstraint,
} from './validators/isNewUsername';
import { IsNewEmail, IsNewEmailConstraint } from './validators/isNewEmail';
import { Type } from 'class-transformer';

export class SignInDto {
  constructor(private prop = true) {}

  @IsEmail()
  email: string;

  password: string;
}

export class SignUpDto {
  @Matches(/^[A-Za-z]([_.-]?[A-Za-z0-9]){7,29}$/)
  // @IsNewUsername({
  //   message: 'The given username is already registerd',
  // })
  username: string;

  @IsEmail()
  // @IsNewEmail({
  //   message: 'The given email is already registerd',
  // })
  email: string;

  @IsStrongPassword()
  password: string;

  // @Matches(/^[a-zA-Z]+([ \-']{0,1}[a-zA-Z]+)*$/)
  // first_name: string;

  // @Matches(/^[a-zA-Z]+([ \-']{0,1}[a-zA-Z]+)*$/)
  // last_name: string;
}
