import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ExtendedError, Server, Socket } from 'socket.io';
import { PrivateMessageDto } from './interfaces/events.dto';
import { Emitter, events } from './interfaces/emitter';
import { Profile, PROFILE } from '../auth/token_extractors/JwtExtractor';
import { AppJwtAuthService } from '../common/AppJwtAuth.service';
import { SocketIoJwtExtractor } from '../auth/token_extractors/socketIoJwtExtractor.service';
import { LanguageService } from '../common/language/language.service';

@Injectable()
export class SocketIoEmitter implements Emitter {
  private server: Server;

  @Inject(LanguageService)
  private readonly langProvider: LanguageService;

  @Inject(AppJwtAuthService)
  private readonly authService: AppJwtAuthService;

  @Inject(SocketIoJwtExtractor)
  private readonly extractor: SocketIoJwtExtractor;

  initialize(server: Server) {
    server.use(this.authenticate);
    this.server = server;
  }

  async handleConnection(client: Socket) {
    const profile: Profile = client.data[PROFILE];
    client.join(String(profile.id));
  }

  async sendMessage(privateMessage: PrivateMessageDto) {
    const { from, to, content } = privateMessage;
    this.server.to([String(from), String(to)]).emit(events.privateMessage, {
      content,
      from: from,
      to: to,
    } as PrivateMessageDto);
  }

  authenticate = async (
    socket: Socket,
    next: (err?: ExtendedError) => void,
  ) => {
    try {
      const canPass = await this.authService.canPass(socket, this.extractor);
      next(canPass ? undefined : new UnauthorizedException());
    } catch (e) {
      next(e);
    }
  };
}
