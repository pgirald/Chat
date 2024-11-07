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
import { Inject, OnApplicationBootstrap } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnApplicationBootstrap
{
  @WebSocketServer()
  server;

  @Inject('EMITTER')
  emitter: Emitter;

  onApplicationBootstrap() {
    this.emitter.setServer(this.server);
  }

  handleConnection(client, ...args: any[]) {
    return this.emitter.handleConnection(client);
  }

  @SubscribeMessage(events.privateMessage)
  sendMessage(@MessageBody() privateMessage: PrivateMessageDto) {
    return this.emitter.sendMessage(privateMessage);
  }
}
