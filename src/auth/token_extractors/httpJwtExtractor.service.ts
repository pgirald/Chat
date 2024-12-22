import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtExtractor, PROFILE, Profile } from './JwtExtractor';
import { BEARER } from '../constants';

@Injectable()
export class HttpJwtExtractor implements JwtExtractor<any> {
  extract(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === BEARER ? token : undefined;
  }

  append(request: any, profile: Profile): void {
    request[PROFILE] = profile;
  }
}

export const HttpJwtExtractorProvider = {
  provide: JwtExtractor,
  useClass: HttpJwtExtractor,
};
