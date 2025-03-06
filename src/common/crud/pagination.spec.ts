import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { AUTHORIZATION, BEARER } from '../../auth/constants';
import { getFakeJwt } from '../../../test/src/common/mockApp/fakeJwt';
import { getTestingApp } from '../../../test/src/common/mockApp/testingApp';
import {
  substrings,
  Tables,
  View,
} from '../../../test/src/persistence/contants';
import {
  fakeClient,
  fakeData,
} from '../../../test/src/persistence/fakeData/fakeData';
import { PAGE_LIMIT } from './constants';

import { useContainer } from 'class-validator';
import * as request from 'supertest';
import { EntitiesPaginationDto, PaginationDto } from './paginationDto';
import { forEachObj, getPage } from 'js_utils';
import { fakeViews } from '../../../test/src/persistence/fakeViews/fakeViews';
import { Chat, Contact } from 'chat-api';
import { permission } from 'process';
import { Client } from '../../persistence/Entities';
import {
  admon,
  blockedAdmon,
  blockedGuest,
  guest,
  noChatsUser,
} from '../../../test/src/persistence/fakeData/specimens';
import {
  chatsNoMatchingFilter,
  contactsNoMatchingFilter,
} from '../../../test/src/persistence/fakeData/noMatchingFilters';
import { ContactsPaginationDto } from '../../contacts/dto/contactsPagination.dto';

describe.each<
  [
    fakeClient: Client,
    (fakeData: Tables) => any[],
    (fakeView: View, fakeClient: Client) => any[],
    (entity: any, filter: any) => boolean,
    number,
    string,
    any,
    any,
  ]
>([
  [
    fakeData.Clients.at(noChatsUser),
    (fakeData) => fakeData.Chats,
    (fakeView) =>
      fakeView.chats.map((chat) => {
        chat.messages = chat.messages.slice(-10);
        chat.subs.sort((sub1, sub2) => sub1.id - sub2.id);
        return chat;
      }),
    (chat: Chat, filter: string) =>
      chat.name.toLowerCase().includes(filter.toLowerCase()),
    8,
    '/chats/find',
    '^&invalid filter +*',
    chatsNoMatchingFilter,
  ],
  [
    fakeData.Clients.at(admon),
    (fakeData) => fakeData.Chats,
    (fakeView) =>
      fakeView.chats.map((chat) => {
        chat.messages = chat.messages.slice(-10);
        chat.subs.sort((sub1, sub2) => sub1.id - sub2.id);
        return chat;
      }),
    (chat: Chat, filter: string) =>
      chat.name.toLowerCase().includes(filter.toLowerCase()),
    8,
    '/chats/find',
    '^&invalid filter +*',
    chatsNoMatchingFilter,
  ],
  [
    fakeData.Clients.at(guest),
    (fakeData) => fakeData.Chats,
    (fakeView) =>
      fakeView.chats.map((chat) => {
        chat.messages = chat.messages.slice(-10);
        chat.subs.sort((sub1, sub2) => sub1.id - sub2.id);
        return chat;
      }),
    (chat: Chat, filter: string) =>
      chat.name.toLowerCase().includes(filter.toLowerCase()),
    8,
    '/chats/find',
    '^&invalid filter +*',
    chatsNoMatchingFilter,
  ],
  [
    fakeData.Clients.at(admon),
    (fakeData) => fakeData.Clients,
    (fakeView) => fakeView.contacts,
    (contact: Contact, filter: string) =>
      contact.username.toLowerCase().includes(filter.toLowerCase()) ||
      contact.email.toLowerCase().includes(filter.toLowerCase()),
    8,
    '/contacts/find',
    '^&invalid filter +*',
    contactsNoMatchingFilter,
  ],
  [
    fakeData.Clients.at(guest),
    (fakeData) => fakeData.Clients,
    (fakeView) => fakeView.contacts,
    (contact: Contact, filter: string) =>
      contact.username.toLowerCase().includes(filter.toLowerCase()) ||
      contact.email.toLowerCase().includes(filter.toLowerCase()),
    8,
    '/contacts/find',
    '^&invalid filter +*',
    contactsNoMatchingFilter,
  ],
  [
    fakeData.Clients.at(blockedAdmon),
    (fakeData) => fakeData.Clients,
    (fakeView) => fakeView.contacts,
    (contact: Contact, filter: string) =>
      contact.username.toLowerCase().includes(filter.toLowerCase()) ||
      contact.email.toLowerCase().includes(filter.toLowerCase()),
    8,
    '/contacts/find',
    '^&invalid filter +*',
    contactsNoMatchingFilter,
  ],
  [
    fakeData.Clients.at(blockedGuest),
    (fakeData) => fakeData.Clients,
    (fakeView) => fakeView.contacts,
    (contact: Contact, filter: string) =>
      contact.username.toLowerCase().includes(filter.toLowerCase()) ||
      contact.email.toLowerCase().includes(filter.toLowerCase()),
    8,
    '/contacts/find',
    '^&invalid filter +*',
    contactsNoMatchingFilter,
  ],
])(
  'Should fetch requested pages',
  (
    fakeClient,
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
      entitiesPaginationDto                                                                                                                                                                        | erroneousProps                 | expectedStatus
      ${{ paginationInfo: { page: 0, count: getFakeData(fakeData).length } } as EntitiesPaginationDto<string>}                                                                                     | ${undefined}                   | ${201}
      ${{ paginationInfo: { page: 0, count: pageCount } } as EntitiesPaginationDto<string>}                                                                                                        | ${undefined}                   | ${201}
      ${{ paginationInfo: { page: Math.floor(Math.ceil(getFakeData(fakeData).length / pageCount) / 2), count: pageCount } } as EntitiesPaginationDto<string>}                                      | ${undefined}                   | ${201}
      ${{ paginationInfo: { page: -Math.floor(Math.ceil(getFakeData(fakeData).length / pageCount) / 2), count: pageCount } } as EntitiesPaginationDto<string>}                                     | ${undefined}                   | ${201}
      ${{ paginationInfo: { page: Math.ceil(getFakeData(fakeData).length / pageCount) + 1, count: pageCount } } as EntitiesPaginationDto<string>}                                                  | ${undefined}                   | ${201}
      ${{ paginationInfo: { page: -(Math.ceil(getFakeData(fakeData).length / pageCount) + 1), count: pageCount } } as EntitiesPaginationDto<string>}                                               | ${undefined}                   | ${201}
      ${{ filter: substrings.Clients.pattern, paginationInfo: { page: 0, count: pageCount } } as EntitiesPaginationDto<string>}                                                                    | ${undefined}                   | ${201}
      ${{ filter: substrings.Clients.pattern, paginationInfo: { page: 0, count: getFakeData(fakeData).length } } as EntitiesPaginationDto<string>}                                                 | ${undefined}                   | ${201}
      ${{ filter: substrings.Clients.pattern, paginationInfo: { page: Math.floor(Math.ceil(getFakeData(fakeData).length / pageCount) / 2), count: pageCount } } as EntitiesPaginationDto<string>}  | ${undefined}                   | ${201}
      ${{ filter: substrings.Clients.pattern, paginationInfo: { page: -Math.floor(Math.ceil(getFakeData(fakeData).length / pageCount) / 2), count: pageCount } } as EntitiesPaginationDto<string>} | ${undefined}                   | ${201}
      ${{ filter: substrings.Clients.pattern, paginationInfo: { page: Math.ceil(getFakeData(fakeData).length / pageCount) + 1, count: pageCount } } as EntitiesPaginationDto<string>}              | ${undefined}                   | ${201}
      ${{ filter: substrings.Clients.pattern, paginationInfo: { page: -(Math.ceil(getFakeData(fakeData).length / pageCount) + 1), count: pageCount } } as EntitiesPaginationDto<string>}           | ${undefined}                   | ${201}
      ${{ filter: noResultsFilter, paginationInfo: { page: 0, count: pageCount } } as EntitiesPaginationDto<string>}                                                                               | ${undefined}                   | ${201}
      ${{ paginationInfo: { page: 0, count: -6 } } as EntitiesPaginationDto<string>}                                                                                                               | ${['count']}                   | ${400}
      ${{ filter: invalidFilter, paginationInfo: { page: 0, count: getFakeData(fakeData).length } } as EntitiesPaginationDto<string>}                                                              | ${['filter']}                  | ${400}
      ${{ paginationInfo: { page: 0.3, count: pageCount } } as EntitiesPaginationDto<string>}                                                                                                      | ${['page']}                    | ${400}
      ${{ paginationInfo: { page: 0.3, count: -6 } } as EntitiesPaginationDto<string>}                                                                                                             | ${['page', 'count']}           | ${400}
      ${{ filter: invalidFilter, paginationInfo: { page: 0.3, count: pageCount } } as EntitiesPaginationDto<string>}                                                                               | ${['page', 'filter']}          | ${400}
      ${{ filter: invalidFilter, paginationInfo: { page: 0, count: -6 } } as EntitiesPaginationDto<string>}                                                                                        | ${['filter', 'count']}         | ${400}
      ${{ filter: invalidFilter, paginationInfo: { page: 0.3, count: -6 } } as EntitiesPaginationDto<string>}                                                                                      | ${['page', 'count', 'filter']} | ${400}
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
          .set(AUTHORIZATION, `${BEARER} ${getFakeJwt(fakeClient)}`)
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
        fakeClient,
      );
      if (filter) {
        views = views.filter((entity) => filterCriteria(entity, filter));
      }
      views.sort((c1, c2) => c1.id - c2.id);
      return getPage(views, page, pageCount);
    }

    afterAll(() => app.close());
  },
);

// test('nothing', () => {});
