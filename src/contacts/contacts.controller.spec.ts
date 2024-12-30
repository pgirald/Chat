import { TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getTestingApp } from '../../test/src/common/mockApp/testingApp';
import { ContactsPaginationDto } from './contacts.dto';
import { AUTHORIZATION, BEARER } from '../auth/constants';
import { fakeJwt } from '../../test/src/common/mockApp/fakeJwt';
import { fakeClient, fakeData } from '../../test/src/persistence/FakeData';
import { Client2ViewService } from './client2view.service';
import { PAGE_LIMIT } from '../common/crud/constants';
import { useContainer } from 'class-validator';
import { Contact } from 'chat-api';
import { forEachObj, getPage } from 'js_utils';
import { fakeViews } from '../../test/src/persistence/fakeViews';
import { substrings } from '../../test/src/persistence/contants';

describe('ContactsController', () => {
  let controller: ContactsController;
  let app: INestApplication;
  let client2view: Client2ViewService;
  const pageCount = 8;
  const noResultsFilter = fakeData.Clients.reduce<{
    email: string;
    username: string;
    filter: string;
  }>(
    (prev, client) => {
      if (client.username.length > prev.username.length) {
        prev.username = client.username;
      }
      if (client.email.length > prev.email.length) {
        prev.email = client.email;
      }
      return prev;
    },
    {
      email: '',
      username: '',
      get filter() {
        let longer: string;
        if (this.email.length > this.username.length) {
          longer = this.email;
        } else {
          longer = this.username;
        }
        return `${longer}m`;
      },
    },
  ).filter;

  beforeAll(async () => {
    let appModule: TestingModule;
    [appModule, app] = await getTestingApp(undefined, (builder) => {
      builder.overrideProvider(PAGE_LIMIT).useValue(fakeData.Clients.length);
    });
    useContainer(appModule, { fallbackOnErrors: true });
    controller = appModule.get(ContactsController);
    client2view = appModule.get(Client2ViewService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    // console.log(
    //   await controller.findPage({ page: 0, count: 5, filter: '' }),
    // );
  });

  it.each`
    contactsPdto                                                                                                                                                                    | erroneousProps                 | expectedStatus
    ${{ paginationInfo: { page: 0, count: fakeData.Clients.length } } as ContactsPaginationDto}                                                                                     | ${undefined}                   | ${201}
    ${{ paginationInfo: { page: 0, count: pageCount } } as ContactsPaginationDto}                                                                                                   | ${undefined}                   | ${201}
    ${{ paginationInfo: { page: Math.floor(Math.ceil(fakeData.Clients.length / pageCount) / 2), count: pageCount } } as ContactsPaginationDto}                                      | ${undefined}                   | ${201}
    ${{ paginationInfo: { page: -Math.floor(Math.ceil(fakeData.Clients.length / pageCount) / 2), count: pageCount } } as ContactsPaginationDto}                                     | ${undefined}                   | ${201}
    ${{ paginationInfo: { page: Math.ceil(fakeData.Clients.length / pageCount) + 1, count: pageCount } } as ContactsPaginationDto}                                                  | ${undefined}                   | ${201}
    ${{ paginationInfo: { page: -(Math.ceil(fakeData.Clients.length / pageCount) + 1), count: pageCount } } as ContactsPaginationDto}                                               | ${undefined}                   | ${201}
    ${{ filter: substrings.Clients.pattern, paginationInfo: { page: 0, count: pageCount } } as ContactsPaginationDto}                                                               | ${undefined}                   | ${201}
    ${{ filter: substrings.Clients.pattern, paginationInfo: { page: 0, count: fakeData.Clients.length } } as ContactsPaginationDto}                                                 | ${undefined}                   | ${201}
    ${{ filter: substrings.Clients.pattern, paginationInfo: { page: Math.floor(Math.ceil(fakeData.Clients.length / pageCount) / 2), count: pageCount } } as ContactsPaginationDto}  | ${undefined}                   | ${201}
    ${{ filter: substrings.Clients.pattern, paginationInfo: { page: -Math.floor(Math.ceil(fakeData.Clients.length / pageCount) / 2), count: pageCount } } as ContactsPaginationDto} | ${undefined}                   | ${201}
    ${{ filter: substrings.Clients.pattern, paginationInfo: { page: Math.ceil(fakeData.Clients.length / pageCount) + 1, count: pageCount } } as ContactsPaginationDto}              | ${undefined}                   | ${201}
    ${{ filter: substrings.Clients.pattern, paginationInfo: { page: -(Math.ceil(fakeData.Clients.length / pageCount) + 1), count: pageCount } } as ContactsPaginationDto}           | ${undefined}                   | ${201}
    ${{ filter: noResultsFilter, paginationInfo: { page: 0, count: pageCount } } as ContactsPaginationDto}                                                                          | ${undefined}                   | ${201}
    ${{ paginationInfo: { page: 0, count: -6 } } as ContactsPaginationDto}                                                                                                          | ${['count']}                   | ${400}
    ${{ filter: '^&invalid filter +*', paginationInfo: { page: 0, count: fakeData.Clients.length } } as ContactsPaginationDto}                                                      | ${['filter']}                  | ${400}
    ${{ paginationInfo: { page: 0.3, count: pageCount } } as ContactsPaginationDto}                                                                                                 | ${['page']}                    | ${400}
    ${{ paginationInfo: { page: 0.3, count: -6 } } as ContactsPaginationDto}                                                                                                        | ${['page', 'count']}           | ${400}
    ${{ filter: '^&invalid filter +*', paginationInfo: { page: 0.3, count: pageCount } } as ContactsPaginationDto}                                                                  | ${['page', 'filter']}          | ${400}
    ${{ filter: '^&invalid filter +*', paginationInfo: { page: 0, count: -6 } } as ContactsPaginationDto}                                                                           | ${['filter', 'count']}         | ${400}
    ${{ filter: '^&invalid filter +*', paginationInfo: { page: 0.3, count: -6 } } as ContactsPaginationDto}                                                                         | ${['page', 'count', 'filter']} | ${400}
  `(
    'should fetch',
    async ({
      contactsPdto,
      erroneousProps,
      expectedStatus,
    }: {
      contactsPdto: ContactsPaginationDto;
      erroneousProps?: string[];
      expectedStatus: number;
    }) => {
      const res = await request(app.getHttpServer())
        .post('/contacts/find')
        .set(AUTHORIZATION, `${BEARER} ${fakeJwt}`)
        .send(contactsPdto);

      expect(res.status).toBe(expectedStatus);

      if (erroneousProps) {
        expect(Object.keys(res.body.detail).sort()).toEqual(
          erroneousProps.sort(),
        );
        return;
      }

      const expected = clientsPage(
        contactsPdto.paginationInfo.page,
        contactsPdto.paginationInfo.count,
        contactsPdto.filter,
      );

      const [contacts, hasMore]: [Contact[], boolean] = res.body;
      forEachObj(contacts, (contact: Contact) => {
        for (const key in contact) {
          if (contact[key] === null) {
            contact[key] = undefined;
          }
        }
      });
      expect(contacts).toEqual(expected[0]);
      expect(hasMore).toBe(expected[1]);
    },
  );

  afterAll(() => {
    return app.close();
  });

  function clientsPage(page: number, pageCount: number, filter?: string) {
    let contacts = fakeViews.find(
      (views) => views.user.id === fakeClient.id,
    ).contacts;
    if (filter) {
      contacts = contacts.filter(
        (contact) =>
          contact.username.toLowerCase().includes(filter.toLowerCase()) ||
          contact.email.toLowerCase().includes(filter.toLowerCase()),
      );
    }
    contacts.sort((c1, c2) => c1.id - c2.id);
    return getPage(contacts, page, pageCount);
  }

  // function clientsPage(
  //   client2view: Client2ViewService,
  //   page: number,
  //   pageCount: number,
  //   filter?: string,
  // ): [Contact[], boolean] {
  //   const [dataPage, hasMore] = getPage(
  //     filter
  //       ? fakeData.Clients.filter((client) => client.username.includes(filter))
  //       : fakeData.Clients,
  //     page,
  //     pageCount,
  //   );

  //   const viewsPage = dataPage
  //     .sort((client1, client2) => client1.id - client2.id)
  //     .map((client) =>
  //       client2view.convert(
  //         client,
  //         fakeData.Locks.filter(
  //           (lock) =>
  //             lock.restrictor === fakeClient.id &&
  //             lock.restricted === client.id,
  //         ),
  //         fakeData.Assignations.filter(
  //           (assignation) => assignation.client === client.id,
  //         ),
  //       ),
  //     );
  //   return [viewsPage, hasMore];
  // }
});
