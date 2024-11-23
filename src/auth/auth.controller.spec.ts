import { INestApplication } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SECRET, SECRET_EXPIRATION } from './constants';
import { MODELS, Models } from '../persistence/constants';
import { AuthService } from './auth.service';
import * as request from 'supertest';
import { SignInDto, SignUpDto } from './auth.dto';
import * as fs from 'fs';
import { Client } from '../../src/persistence/Entities';
import { FakePersistenceModule } from '../../test/src/persistence/fakePersistence.module';
import { defaultPassword, Tables } from '../../test/src/persistence/contants';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { LoggingFilter } from '../../test/src/common/logging.filter';
// import { useContainer } from 'class-validator';
// import { IsNewUsernameConstraint } from './validators/isNewUsername';
// import { IsNewEmailConstraint } from './validators/isNewEmail';

describe('ContactsController', () => {
  let authController: AuthController;
  let models: Models;
  let app: INestApplication;
  let fakeData: Tables = JSON.parse(
    fs.readFileSync('test/fakeData.json').toString(),
  );

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
        FakePersistenceModule,
      ],
      providers: [
        AuthService /*IsNewUsernameConstraint, IsNewEmailConstraint*/,
        {
          provide: APP_GUARD,
          useClass: AuthGuard,
        },
        { provide: APP_FILTER, useClass: LoggingFilter },
      ],
      controllers: [AuthController],
    }).compile();
    authController = module.get(AuthController);
    models = module.get(MODELS);
    app = module.createNestApplication();
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

  afterAll(() => {
    return app.close();
  });
});
