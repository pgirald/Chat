import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Emitter, events } from './interfaces/emitter';
import { PrivateMessageDto } from './interfaces/events.dto';
import { ExecutionContext, Inject, UseGuards } from '@nestjs/common';
import { AppValidationPipe } from '../common/AppValidation.pipe';
import { DATA, EMITTER } from './constants';
import { LanguageGuard } from '../common/language/language.Guard';

@UseGuards(LanguageGuard)
@WebSocketGateway({
  cors: {
    origin: '*', //TODO: Only the next application can consume the gateway
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server;

  @Inject(EMITTER)
  emitter: Emitter;

  context: ExecutionContext;

  onApplicationBootstrap() {
    this.emitter.initialize(this.server);
  }

  handleConnection(client, ...args: any[]) {
    return this.emitter.handleConnection(client);
  }

  @SubscribeMessage(events.privateMessage)
  sendMessage(
    @MessageBody(DATA, AppValidationPipe)
    privateMessage: PrivateMessageDto,
  ) {
    return this.emitter.sendMessage(privateMessage);
  }
}
