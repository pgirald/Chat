import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FakePersistenceModule } from '../../test/src/persistence/fakePersistence.module';

describe('ContactsController', () => {
  let controller: ContactsController;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FakePersistenceModule],
      controllers: [ContactsController],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
    app = module.createNestApplication();
    app.enableShutdownHooks();
    await app.init();
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
