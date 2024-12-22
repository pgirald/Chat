import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignInDto, SignUpDto } from './auth.dto';
import { AppValidationPipe } from '../common/AppValidation.pipe';
import { CredentialsPipe } from './credentials.pipe';
import { Profile, PROFILE } from './token_extractors/JwtExtractor';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  signIn(@Body(AppValidationPipe) signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Public()
  @Post('signUp')
  signUp(@Body(AppValidationPipe, CredentialsPipe) signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Get('profile')
  fetchProfile(@Request() request) {
    return request[PROFILE] as Profile;
  }
}
