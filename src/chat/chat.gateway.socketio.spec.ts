import { createServer } from 'http';
import { AddressInfo } from 'net';
import { Socket, io as ioc } from 'socket.io-client';
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { INestApplication } from '@nestjs/common';
import { events } from './interfaces/emitter';
import { PrivateMessageDto } from './interfaces/events.dto';
import { SocketIoEmitter } from './SocketIoEmitter.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../auth/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SECRET, SECRET_EXPIRATION } from '../auth/constants';
import { EMITTER } from './constants';

const usernames = { user1: 'Maki', user2: 'Yuji', user3: 'Zukuna' };

function waitFor(socket: Socket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let app: INestApplication;
  let user1: Socket, user2: Socket, user3: Socket;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get(SECRET),
            signOptions: { expiresIn: configService.get(SECRET_EXPIRATION) },
          }),
        }),
      ],
      providers: [
        ChatGateway,
        //AuthGuard,
        { provide: EMITTER, useClass: SocketIoEmitter },
      ],
    }).compile();

    gateway = module.get(ChatGateway);
    app = module.createNestApplication();
    await app.init();
    const httpServer = app.getHttpServer();

    await new Promise((resolve) => {
      httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
        user1 = ioc(`http://localhost:${port}`, { autoConnect: false });
        user2 = ioc(`http://localhost:${port}`, { autoConnect: false });
        user3 = ioc(`http://localhost:${port}`, { autoConnect: false });
        user1.auth = { username: usernames.user1 };
        user2.auth = { username: usernames.user2 };
        user3.auth = { username: usernames.user3 };
        user1.connect();
        user2.connect();
        user3.connect();
        resolve('done');
      });
    });
    await Promise.all([
      waitFor(user1, 'connect'),
      waitFor(user2, 'connect'),
      waitFor(user3, 'connect'),
    ]);
  });

  test('Chatting', async () => {
    const checkMsgsMatch = jest.fn((received: PrivateMessageDto) => {
      checkMsgs(received);
    });
    let sent = {
      content: `Hello ${usernames.user2}!!`,
      from: usernames.user1,
      to: usernames.user2,
    };
    let promise: Promise<any>;
    user1.once(events.privateMessage, checkMsgsMatch);
    user2.once(events.privateMessage, checkMsgsMatch);
    promise = Promise.all([
      waitFor(user1, events.privateMessage),
      waitFor(user2, events.privateMessage),
    ]);
    user1.emit(events.privateMessage, sent);
    await promise;
    sent = {
      content: `Hello ${usernames.user1}, what happens?`,
      from: usernames.user2,
      to: usernames.user1,
    };
    user1.once(events.privateMessage, checkMsgsMatch);
    user2.once(events.privateMessage, checkMsgsMatch);
    promise = Promise.all([
      waitFor(user1, events.privateMessage),
      waitFor(user2, events.privateMessage),
    ]);
    user2.emit(events.privateMessage, sent);
    await promise;

    expect(checkMsgsMatch.mock.calls).toHaveLength(4);

    function checkMsgs(received: PrivateMessageDto) {
      expect(received).toEqual(sent);
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
