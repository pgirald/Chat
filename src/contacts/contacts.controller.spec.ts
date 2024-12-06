import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getTestingApp } from '../../test/src/common/testingApp';

describe('ContactsController', () => {
  let controller: ContactsController;
  let app: INestApplication;

  beforeAll(async () => {
    let appModule: TestingModule;
    [appModule, app] = await getTestingApp();
    controller = appModule.get(ContactsController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
    return request(app.getHttpServer())
      .post('/contacts/find')
      .send({ page: -8, count: 5 })
      .then((res) => {
        if (res.error) {
          console.log(res.error);
        } else {
          console.log(res.body);
        }
      });

    // console.log(
    //   await controller.findPage({ page: 0, count: 5, filter: '' }),
    // );
  });

  afterAll(() => {
    return app.close();
  });
});
