import { INestApplication } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SECRET, SECRET_EXPIRATION } from './constants';
import { MODELS, Models } from '../persistence/constants';
import { AuthService } from './auth.service';
import * as request from 'supertest';
import { SignInDto, SignUpDto } from './auth.dto';
import * as fs from 'fs';
import { Client } from '../../src/persistence/Entities';
import { defaultPassword, Tables } from '../../test/src/persistence/contants';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { ConsoleLogFilter } from '../../test/src/common/consoleLog.filter';
import { HttpJwtExtractor } from './token_extractors/httpJwtExtractor.service';
import { Profile } from './token_extractors/JwtExtractor';
import { getTestingApp } from '../../test/src/common/testingApp';
// import { useContainer } from 'class-validator';
// import { IsNewUsernameConstraint } from './validators/isNewUsername';
// import { IsNewEmailConstraint } from './validators/isNewEmail';

describe('ContactsController', () => {
  let authController: AuthController;
  let models: Models;
  let app: INestApplication;
  const fakeData: Tables = JSON.parse(
    fs.readFileSync('test/fakeData.json').toString(),
  );
  let jwtService: JwtService;
  let config: ConfigService;

  beforeAll(async () => {
    let appModule: TestingModule;
    [appModule, app] = await getTestingApp({
      providers: [{ provide: APP_FILTER, useClass: ConsoleLogFilter }],
    });

    config = appModule.get(ConfigService);
    authController = appModule.get(AuthController);
    jwtService = appModule.get(JwtService);
    models = appModule.get(MODELS);
    app = appModule.createNestApplication();
    app.enableShutdownHooks();
    //useContainer(module, { fallbackOnErrors: true });
    await app.init();
  }, 100000);

  it('should be defined', async () => {
    expect(authController).toBeDefined();
  });

  it.each`
    signUpDto                                                                                                     | expectedStatus | erroneousProps
    ${{ username: 'us', email: 'validmail@mail.com', password: 'Strong Pass @ 1234567' }}                         | ${400}         | ${['username']}
    ${{ username: 'validUser123', email: 'invalid-email', password: 'Strong Pass @ 1234567' }}                    | ${400}         | ${['email']}
    ${{ username: 'validUser123', email: 'validmail@mail.com', password: 'weak' }}                                | ${400}         | ${['password']}
    ${{ username: 'us', email: 'invalid-email', password: 'Strong Pass @ 1234567' }}                              | ${400}         | ${['email', 'username']}
    ${{ username: 'validUser123', email: 'invalid-email', password: 'weak' }}                                     | ${400}         | ${['email', 'password']}
    ${{ username: 'us', email: 'validmail@mail.com', password: 'weak' }}                                          | ${400}         | ${['username', 'password']}
    ${{ username: 'us', email: 'invalid-email', password: 'weak' }}                                               | ${400}         | ${['username', 'password', 'email']}
    ${{ username: fakeData.Clients[0].username, email: 'validmail@mail.com', password: 'Strong Pass @ 1234567' }} | ${400}         | ${['username']}
    ${{ username: 'validUser123', email: fakeData.Clients[0].email, password: 'Strong Pass @ 1234567' }}          | ${400}         | ${['email']}
    ${{ ...fakeData.Clients[0], password: 'Strong Pass @ 1234567' }}                                              | ${400}         | ${['email', 'username']}
    ${{ username: 'validUser123', email: 'validmail@mail.com', password: 'Strong Pass @ 1234567' }}               | ${201}         | ${undefined}
  `(
    'should sign up',
    async ({
      signUpDto,
      expectedStatus,
      erroneousProps,
    }: {
      signUpDto: SignUpDto;
      expectedStatus: number;
      erroneousProps?: ('username' | 'email' | 'password')[];
    }) => {
      const res = await request(app.getHttpServer())
        .post('/auth/signUp')
        .set('accept-language', 'es')
        .send(signUpDto);
      if (!res.error) {
        await models.Clients.destroy({ where: { email: signUpDto.email } });
        const user: Client = res.body;
        expect({ email: user.email, username: user.username }).toEqual({
          email: signUpDto.email,
          username: signUpDto.username,
        });
      } else if (erroneousProps) {
        expect(Object.keys(res.body).sort()).toEqual(erroneousProps.sort());
      }
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each`
    signInDto                                                           | expectedStatus | erroneousProps
    ${{ email: fakeData.Clients[0].email, password: 'wrong password' }} | ${401}         | ${undefined}
    ${{ email: 'nonexisting@mail.com', password: defaultPassword }}     | ${401}         | ${undefined}
    ${{ email: 'invalid-email', password: defaultPassword }}            | ${400}         | ${['email']}
    ${{ email: fakeData.Clients[0].email, password: defaultPassword }}  | ${200}         | ${undefined}
  `(
    'should sign in',
    async ({
      signInDto,
      expectedStatus,
      erroneousProps,
    }: {
      signInDto: SignInDto;
      expectedStatus: number;

      erroneousProps: ('username' | 'email' | 'password')[] | undefined;
    }) => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(signInDto);
      if (!res.error) {
        console.log(res.body);
        expect(res.body).toHaveProperty('access_token');
        expect(typeof res.body.access_token).toBe('string');
      } else if (erroneousProps) {
        expect(Object.keys(res.body).sort()).toEqual(erroneousProps.sort());
      }
      expect(res.status).toBe(expectedStatus);
    },
  );

  it.each`
    profile                                                                              | token              | expiration_sg | expectedStatus | expectedError
    ${undefined}                                                                         | ${'invalid_token'} | ${3600}       | ${401}         | ${'jwt malformed'}
    ${{ id: fakeData.Clients[0].id, username: fakeData.Clients[0].username } as Profile} | ${undefined}       | ${3600}       | ${200}         | ${undefined}
    ${{ id: fakeData.Clients[0].id, username: fakeData.Clients[0].username } as Profile} | ${undefined}       | ${0}          | ${401}         | ${'jwt expired'}
  `(
    'should fetch profile',
    async ({
      token,
      expiration_sg,
      profile,
      expectedStatus,
      expectedError,
    }: {
      token?: string;
      expiration_sg: number;
      profile?: Profile;
      expectedStatus: number;
      expectedError: string;
    }) => {
      let jwt: string;
      if (profile) {
        jwt = await jwtService.signAsync(
          {
            id: profile.id,
            username: profile.username,
          } as Profile,
          {
            secret: config.get(SECRET),
            expiresIn: expiration_sg,
          },
        );
      } else {
        jwt = token || 'not specified';
      }
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${jwt}`);
      expect(res.status).toBe(expectedStatus);
      if (expectedError) {
        expect(res.body.message).toBe(expectedError);
      } else if (profile) {
        expect(res.body.username).toBe(profile.username);
        expect(res.body.id).toBe(profile.id);
      }
    },
  );

  afterAll(() => {
    return app.close();
  });
});
