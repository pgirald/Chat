import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io-client';
import { LanguageGuard } from '../../../../src/common/language/language.Guard';
import { LanguageService } from '../../../../src/common/language/language.service';
import { LANG } from 'src/chat/constants';

export const PING = 'ping';

export const PONG = 'pong';

@UseGuards(LanguageGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LanguageGateway {
  constructor(private readonly langProvider: LanguageService) {}

  @SubscribeMessage(PING)
  handleMessage(@ConnectedSocket() client: Socket) {
    client.emit(PONG, this.langProvider.language.lang);
  }
}
