import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtExtractor, PROFILE, Profile } from './JwtExtractor';
import { Socket } from 'socket.io';

@Injectable()
export class SocketIoJwtExtractor implements JwtExtractor<Socket> {
  extract(client: Socket): string | undefined {
    const token = client.handshake.auth.token;
    if (typeof token === 'string') {
      return token;
    }
    return undefined;
  }

  append(client: Socket, profile: Profile): void {
    client.data[PROFILE] = profile;
  }
}

export const SocketIoJwtExtractorProvider = {
  provide: JwtExtractor,
  useClass: SocketIoJwtExtractor,
};
