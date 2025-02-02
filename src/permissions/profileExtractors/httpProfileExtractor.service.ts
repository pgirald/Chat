import { ExecutionContext, Injectable } from '@nestjs/common';
import { ProfileExtractor } from './profileExtractor';
import { PROFILE, Profile } from '../../auth/token_extractors/JwtExtractor';
import { Permission } from '../../persistence/Entities';
import { PERMISSIONS } from '../../persistence/constants';
import { CURRENT_PERMISSIONS } from '../constants';

@Injectable()
export class HttpProfileExtractor implements ProfileExtractor {
  extract(context: ExecutionContext): Profile {
    const request = context.switchToHttp().getRequest();
    return request[PROFILE];
  }

  append(context: ExecutionContext, permissions: Permission[]): void {
    const request = context.switchToHttp().getRequest();
    request[CURRENT_PERMISSIONS] = permissions;
  }
}
