import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Emitter, events } from './interfaces/emitter';
import { PrivateMessageDto } from './interfaces/events.dto';
import {
  ExecutionContext,
  Inject,
  OnApplicationBootstrap,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppValidationPipe } from '../common/AppValidation.pipe';
import { AuthGuard } from '../auth/auth.guard';
import { EMITTER } from './constants';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

//TODO: Only the next application can consume the gateway
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection
{
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
    @MessageBody(AppValidationPipe) privateMessage: PrivateMessageDto,
  ) {
    return this.emitter.sendMessage(privateMessage);
  }
}
