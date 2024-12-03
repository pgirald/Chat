import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { SECRET } from './constants';
import { JwtExtractor } from './token_extractors/JwtExtractor';
import { AppJwtAuthService } from '../common/AppJwtAuth.service';
import { HttpJwtExtractor } from './token_extractors/httpJwtExtractor.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AppJwtAuthService,
    private reflector: Reflector,
    private extractor: HttpJwtExtractor,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return await this.authService.canPass(
      context.switchToHttp().getRequest(),
      this.extractor,
    );
  }
}
