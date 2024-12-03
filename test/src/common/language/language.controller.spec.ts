import { Test, TestingModule } from '@nestjs/testing';
import { LanguageController } from './language.controller';
import { LanguageService } from '../../../../src/common/language/language.service';
import { HttpLangExtractorProvider } from '../../../../src/common/language/langExtractors/httpLangExtractor';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { english, spanish } from '../../../../src/common/language/constants';
import { after } from 'node:test';
import { LangMiddleware } from './lang.middleware';
import { NextFunction } from 'express';

describe('AppController', () => {
  let languageController: LanguageController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguageController],
      providers: [LanguageService, HttpLangExtractorProvider],
    }).compile();

    languageController = module.get(LanguageController);

    app = module.createNestApplication();
    await app.init();
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
