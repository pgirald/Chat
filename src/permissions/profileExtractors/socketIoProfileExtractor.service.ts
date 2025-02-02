import { ExecutionContext, Injectable } from '@nestjs/common';
import { ProfileExtractor } from './profileExtractor';
import { PROFILE, Profile } from 'src/auth/token_extractors/JwtExtractor';
import { Socket } from 'socket.io';
import { Permission } from 'src/persistence/Entities';
import { CURRENT_PERMISSIONS } from '../constants';

@Injectable()
export class SocketIoProfileExtractorService implements ProfileExtractor {
  extract(context: ExecutionContext): Profile {
    return (context.switchToWs().getClient() as Socket).data[PROFILE];
  }

  append(context: ExecutionContext, permissions: Permission[]): void {
    (context.switchToWs().getClient() as Socket).data[CURRENT_PERMISSIONS] =
      permissions;
  }
}
