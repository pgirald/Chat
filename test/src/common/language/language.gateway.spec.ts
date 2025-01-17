import { AddressInfo } from 'net';
import { Socket, io as ioc } from 'socket.io-client';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { LanguageService } from '../../../../src/common/language/language.service';
import { IoLangExtractorProvider } from '../../../../src/common/language/langExtractors/socketIoLangExtractor';
import { LanguageGateway, PING, PONG } from './language.gateway';
import { english, spanish } from '../../../../src/common/language/constants';
import { waitFor } from '../../../../test/utils/socketio/events';

describe('ChatGateway', () => {
  let gateway: LanguageGateway;
  let app: INestApplication;
  let user: Socket;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LanguageGateway, LanguageService, IoLangExtractorProvider],
    }).compile();

    gateway = module.get(LanguageGateway);
    app = module.createNestApplication();
    await app.init();
    const httpServer = app.getHttpServer();

    await new Promise((resolve) => {
      httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
        user = ioc(`http://localhost:${port}`, { autoConnect: false });
        user.connect();
        resolve('done');
      });
    });
    await waitFor(user, 'connect');
  });

  test('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it.each`
    tag         | expectedLang
    ${'en'}     | ${english.lang}
    ${'es'}     | ${spanish.lang}
    ${'random'} | ${english.lang}
    ${''}       | ${english.lang}
    ${null}     | ${english.lang}
  `(
    'should get language',
    async ({ tag, expectedLang }: { tag: string; expectedLang: string }) => {
      user.emit(PING, { lang: tag });
      await waitFor(user, PONG, (lang: string) => {
        expect(lang).toBe(expectedLang);
      });
    },
  );

  afterAll(() => {
    user.disconnect();
    return app.close();
  });
});
