import { TestingModule } from '@nestjs/testing';
import { LanguageController } from './language.controller';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { english, spanish } from '../../../../src/common/language/constants';
import { getTestingApp } from '../mockApp/testingApp';

describe('AppController', () => {
  let languageController: LanguageController;
  let app: INestApplication;

  beforeAll(async () => {
    let appModule: TestingModule;
    [appModule, app] = await getTestingApp({
      controllers: [LanguageController],
    });
    languageController = appModule.get(LanguageController);
  });

  test('should be defined', () => {
    expect(languageController).toBeDefined();
  });

  it.each`
    tag         | expectedLang    | expectedStatus
    ${'en'}     | ${english.lang} | ${200}
    ${'es'}     | ${spanish.lang} | ${200}
    ${'random'} | ${english.lang} | ${200}
    ${''}       | ${english.lang} | ${200}
    ${null}     | ${english.lang} | ${200}
  `(
    '',
    async ({
      tag,
      expectedLang,
      expectedStatus,
    }: {
      tag: string;
      expectedLang: string;
      expectedStatus: number;
    }) => {
      const res = await request(app.getHttpServer())
        .get('/language')
        .set('accept-language', tag);
      expect(res.status).toBe(expectedStatus);
      expect(res.text).toBe(expectedLang);
    },
  );

  afterAll(() => {
    return app.close();
  });
});
