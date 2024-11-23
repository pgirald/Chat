import { Test, TestingModule } from '@nestjs/testing';
import { SocketIoEmitter } from './SocketIoEmitter.service';
import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

describe('Chat', () => {
  let provider: SocketIoEmitter;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketIoEmitter],
    }).compile();

    provider = module.get<SocketIoEmitter>(SocketIoEmitter);
    app = module.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.init();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
