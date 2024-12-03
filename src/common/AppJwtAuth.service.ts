import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SECRET } from '../auth/constants';
import { JwtExtractor } from '../auth/token_extractors/JwtExtractor';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppJwtAuthService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canPass(request: any, extractor: JwtExtractor<any>) {
    const token = extractor.extract(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const profile = await this.jwtService.verifyAsync(token, {
        secret: this.config.get(SECRET),
      });
      extractor.append(request, profile);
    } catch (e) {
      throw new UnauthorizedException(e);
    }
    return true;
  }
}
