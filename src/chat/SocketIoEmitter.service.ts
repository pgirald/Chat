import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrivateMessageDto } from './interfaces/events.dto';
import { Emitter, events } from './interfaces/emitter';

@Injectable()
export class SocketIoEmitter implements Emitter {
  private server: Server;

  setServer(server: any) {
    // if (!(server instanceof Server)) {
    //   throw new Error(
    //     `In order to use ${SocketIoEmitter.name}, the provided server
    //     must be an instance of Socket.io ${Server.name}`,
    //   );
    // }
    this.server = server;
  }

  async handleConnection(client: Socket) {
    const username = client.handshake.auth.username;
    const sockets = this.server.of('/').sockets;
    if (!username) {
      throw new Error('invalid username');
    }
    sockets.forEach((s) => {
      if (s.data.username === username) {
        throw new Error('The specified username is not avialable');
      }
    });
    client.join(username);
  }

  async sendMessage(privateMessage: PrivateMessageDto) {
    const { from, to, content } = privateMessage;
    this.server.to([from, to]).emit(events.privateMessage, {
      content,
      from: from,
      to: to,
    } as PrivateMessageDto);
  }
}
