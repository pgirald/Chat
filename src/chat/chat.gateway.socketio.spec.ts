import { AddressInfo } from 'net';
import { Socket, io as ioc } from 'socket.io-client';
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { INestApplication } from '@nestjs/common';
import { events } from './interfaces/emitter';
import { PrivateMessageDto } from './interfaces/events.dto';
import { SocketIoEmitter } from './SocketIoEmitter.service';
import { AuthGuard } from '../auth/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SECRET, SECRET_EXPIRATION } from '../auth/constants';
import { EMITTER } from './constants';
import {
  SocketIoJwtExtractor,
  SocketIoJwtExtractorProvider,
} from '../auth/token_extractors/socketIoJwtExtractor.service';
import { config } from 'process';
import { AppJwtAuthService } from '../common/AppJwtAuth.service';
import { waitFor } from '../../test/utils/socketio/events';
import { LanguageService } from '../common/language/language.service';
import { IoLangExtractorProvider } from '../common/language/langExtractors/socketIoLangExtractor';

const profiles = {
  user1: { id: 1, username: 'Maki' },
  user2: { id: 2, username: 'Yuji' },
  user3: { id: 3, username: 'Zukuna' },
};

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let app: INestApplication;
  let user1: Socket, user2: Socket, user3: Socket;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: 'secret.test.env' }),
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
        { provide: EMITTER, useClass: SocketIoEmitter },
        SocketIoJwtExtractor,
        AppJwtAuthService,
        LanguageService,
        IoLangExtractorProvider,
      ],
    }).compile();

    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
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
        user1.auth = {
          token: jwtService.sign(profiles.user1, {
            secret: configService.get(SECRET),
          }),
        };
        user2.auth = {
          token: jwtService.sign(profiles.user2, {
            secret: configService.get(SECRET),
          }),
        };
        user3.auth = {
          token: jwtService.sign(profiles.user3, {
            secret: configService.get(SECRET),
          }),
        };
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
  }, 60000);

  test('Chatting', async () => {
    const checkMsgsMatch = jest.fn((received: PrivateMessageDto) => {
      checkMsgs(received);
    });
    let sent = {
      content: `Hello ${profiles.user2.username}!!`,
      from: profiles.user1.id,
      to: profiles.user2.id,
    };
    let promise: Promise<any>;
    promise = Promise.all([
      waitFor(user1, events.privateMessage, checkMsgsMatch),
      waitFor(user2, events.privateMessage, checkMsgsMatch),
    ]);
    user1.emit(events.privateMessage, { data: sent, lang: 'em' });
    await promise;
    sent = {
      content: `Hello ${profiles.user1.username}, what happens?`,
      from: profiles.user2.id,
      to: profiles.user1.id,
    };
    promise = Promise.all([
      waitFor(user1, events.privateMessage, checkMsgsMatch),
      waitFor(user2, events.privateMessage, checkMsgsMatch),
    ]);
    user2.emit(events.privateMessage, { data: sent, lang: 'em' });
    await promise;

    expect(checkMsgsMatch.mock.calls).toHaveLength(4);

    function checkMsgs(received: PrivateMessageDto) {
      expect(received).toEqual(sent);
    }
  });

  afterAll(async () => {
    await app.close();
    user1.disconnect();
    user2.disconnect();
    user3.disconnect();
  });
});
