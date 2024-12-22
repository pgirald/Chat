import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getTestingApp } from '../../test/src/common/mockApp/testingApp';
import { ContactsPaginationDto } from './contacts.dto';
import { AUTHORIZATION, BEARER } from '../auth/constants';
import { fakeJwt } from '../../test/src/common/mockApp/fakeJwt';

describe('ContactsController', () => {
  let controller: ContactsController;
  let app: INestApplication;

  beforeAll(async () => {
    let appModule: TestingModule;
    [appModule, app] = await getTestingApp();
    controller = appModule.get(ContactsController);
  }, 100000);

  it('should be defined', () => {
    expect(controller).toBeDefined();
    // console.log(
    //   await controller.findPage({ page: 0, count: 5, filter: '' }),
    // );
  });

  it('should fetch', async () => {
    const res = await request(app.getHttpServer())
      .post('/contacts/find')
      .set(AUTHORIZATION, `${BEARER} ${fakeJwt}`)
      .send({
        paginationInfo: { page: 0, count: 5 },
      } as ContactsPaginationDto);

    expect(res.status).toBe(201);
  });

  afterAll(() => {
    return app.close();
  });
});
