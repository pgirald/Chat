import { Test, TestingModule } from '@nestjs/testing';
import { SocketIoEmitter } from './SocketIoEmitter.service';

describe('Chat', () => {
  let provider: SocketIoEmitter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketIoEmitter],
    }).compile();

    provider = module.get<SocketIoEmitter>(SocketIoEmitter);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
