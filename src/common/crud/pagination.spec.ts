import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { AUTHORIZATION, BEARER } from '../../auth/constants';
import { ContactsPaginationDto } from '../../contacts/contacts.dto';
import { fakeJwt } from '../../../test/src/common/mockApp/fakeJwt';
import { getTestingApp } from '../../../test/src/common/mockApp/testingApp';
import {
  substrings,
  Tables,
  View,
} from '../../../test/src/persistence/contants';
import { fakeClient, fakeData } from '../../../test/src/persistence/FakeData';
import { PAGE_LIMIT } from './constants';
import { useContainer } from 'class-validator';
import * as request from 'supertest';
import { EntitiesPaginationDto } from './paginationDto';
import { forEachObj, getPage } from 'js_utils';
import { fakeViews } from '../../../test/src/persistence/fakeViews';
import { ContactsController } from '../../contacts/contacts.controller';
import { Contact } from 'chat-api';

const contactsNoResultsFilter = fakeData.Clients.reduce<{
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

describe.each<
  [
    (fakeData: Tables) => any[],
    (fakeView: View) => any[],
    (entity: any, filter: any) => boolean,
    number,
    string,
    any,
    any,
    new (...any: any) => any,
  ]
>([
  [
    (fakeData) => fakeData.Clients,
    (fakeView) => fakeView.contacts,
    (contact: Contact, filter: string) =>
      contact.username.toLowerCase().includes(filter.toLowerCase()) ||
      contact.email.toLowerCase().includes(filter.toLowerCase()),
    8,
    '/contacts/find',
    '^&invalid filter +*',
    contactsNoResultsFilter,
    ContactsController,
  ],
])(
  'Should fetch requested pages',
  (
    getFakeData,
    getFakeView,
    filterCriteria,
    pageCount,
    endPoint,
    invalidFilter,
    noResultsFilter,
  ) => {
    let app: INestApplication;

    beforeAll(async () => {
      let appModule: TestingModule;
      [appModule, app] = await getTestingApp(undefined, (builder) => {
        builder
          .overrideProvider(PAGE_LIMIT)
          .useValue(getFakeData(fakeData).length);
      });
      useContainer(appModule, { fallbackOnErrors: true });
    });

    it.each`
      entitiesPaginationDto                                                                                                                                                                | erroneousProps                 | expectedStatus
      ${{ paginationInfo: { page: 0, count: getFakeData(fakeData).length } } as ContactsPaginationDto}                                                                                     | ${undefined}                   | ${201}
      ${{ paginationInfo: { page: 0, count: pageCount } } as ContactsPaginationDto}                                                                                                        | ${undefined}                   | ${201}
      ${{ paginationInfo: { page: Math.floor(Math.ceil(getFakeData(fakeData).length / pageCount) / 2), count: pageCount } } as ContactsPaginationDto}                                      | ${undefined}                   | ${201}
      ${{ paginationInfo: { page: -Math.floor(Math.ceil(getFakeData(fakeData).length / pageCount) / 2), count: pageCount } } as ContactsPaginationDto}                                     | ${undefined}                   | ${201}
      ${{ paginationInfo: { page: Math.ceil(getFakeData(fakeData).length / pageCount) + 1, count: pageCount } } as ContactsPaginationDto}                                                  | ${undefined}                   | ${201}
      ${{ paginationInfo: { page: -(Math.ceil(getFakeData(fakeData).length / pageCount) + 1), count: pageCount } } as ContactsPaginationDto}                                               | ${undefined}                   | ${201}
      ${{ filter: substrings.Clients.pattern, paginationInfo: { page: 0, count: pageCount } } as ContactsPaginationDto}                                                                    | ${undefined}                   | ${201}
      ${{ filter: substrings.Clients.pattern, paginationInfo: { page: 0, count: getFakeData(fakeData).length } } as ContactsPaginationDto}                                                 | ${undefined}                   | ${201}
      ${{ filter: substrings.Clients.pattern, paginationInfo: { page: Math.floor(Math.ceil(getFakeData(fakeData).length / pageCount) / 2), count: pageCount } } as ContactsPaginationDto}  | ${undefined}                   | ${201}
      ${{ filter: substrings.Clients.pattern, paginationInfo: { page: -Math.floor(Math.ceil(getFakeData(fakeData).length / pageCount) / 2), count: pageCount } } as ContactsPaginationDto} | ${undefined}                   | ${201}
      ${{ filter: substrings.Clients.pattern, paginationInfo: { page: Math.ceil(getFakeData(fakeData).length / pageCount) + 1, count: pageCount } } as ContactsPaginationDto}              | ${undefined}                   | ${201}
      ${{ filter: substrings.Clients.pattern, paginationInfo: { page: -(Math.ceil(getFakeData(fakeData).length / pageCount) + 1), count: pageCount } } as ContactsPaginationDto}           | ${undefined}                   | ${201}
      ${{ filter: noResultsFilter, paginationInfo: { page: 0, count: pageCount } } as ContactsPaginationDto}                                                                               | ${undefined}                   | ${201}
      ${{ paginationInfo: { page: 0, count: -6 } } as ContactsPaginationDto}                                                                                                               | ${['count']}                   | ${400}
      ${{ filter: invalidFilter, paginationInfo: { page: 0, count: getFakeData(fakeData).length } } as ContactsPaginationDto}                                                              | ${['filter']}                  | ${400}
      ${{ paginationInfo: { page: 0.3, count: pageCount } } as ContactsPaginationDto}                                                                                                      | ${['page']}                    | ${400}
      ${{ paginationInfo: { page: 0.3, count: -6 } } as ContactsPaginationDto}                                                                                                             | ${['page', 'count']}           | ${400}
      ${{ filter: invalidFilter, paginationInfo: { page: 0.3, count: pageCount } } as ContactsPaginationDto}                                                                               | ${['page', 'filter']}          | ${400}
      ${{ filter: invalidFilter, paginationInfo: { page: 0, count: -6 } } as ContactsPaginationDto}                                                                                        | ${['filter', 'count']}         | ${400}
      ${{ filter: invalidFilter, paginationInfo: { page: 0.3, count: -6 } } as ContactsPaginationDto}                                                                                      | ${['page', 'count', 'filter']} | ${400}
    `(
      'should fetch',
      async ({
        entitiesPaginationDto,
        erroneousProps,
        expectedStatus,
      }: {
        entitiesPaginationDto: EntitiesPaginationDto<any>;
        erroneousProps?: string[];
        expectedStatus: number;
      }) => {
        const res = await request(app.getHttpServer())
          .post(endPoint)
          .set(AUTHORIZATION, `${BEARER} ${fakeJwt}`)
          .send(entitiesPaginationDto);

        expect(res.status).toBe(expectedStatus);

        if (erroneousProps) {
          expect(Object.keys(res.body.detail).sort()).toEqual(
            erroneousProps.sort(),
          );
          return;
        }

        const expected = entitiesPage(
          entitiesPaginationDto.paginationInfo.page,
          entitiesPaginationDto.paginationInfo.count,
          entitiesPaginationDto.filter,
        );

        const [entities, hasMore]: [any[], boolean] = res.body;

        forEachObj(entities, (entity) => {
          for (const key in entity) {
            if (entity[key] === null) {
              entity[key] = undefined;
            }
          }
        });

        expect(entities).toEqual(expected[0]);
        expect(hasMore).toBe(expected[1]);
      },
    );

    function entitiesPage(page: number, pageCount: number, filter?: any) {
      let views = getFakeView(
        fakeViews.find((views) => views.user.id === fakeClient.id),
      );

      if (filter) {
        views = views.filter((entity) => filterCriteria(entity, filter));
      }
      views.sort((c1, c2) => c1.id - c2.id);
      return getPage(views, page, pageCount);
    }
  },
);
