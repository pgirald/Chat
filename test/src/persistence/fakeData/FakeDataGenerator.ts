import { faker } from '@faker-js/faker';
import {
  Assignation,
  Attachment,
  Banned,
  Chat,
  Client,
  Lock,
  Message,
  Named,
  permissionsEnum,
  restrictionsEnum,
  Ringtone,
  Setting,
  Subscription,
} from '../../../../src/persistence/Entities';
import * as bcrypt from 'bcrypt';
import { TablesNames } from '../../../../src/persistence/constants';
import {
  DEFAULT_PASSWORD,
  substrings,
  Tables,
  TablesPatterns,
} from '../contants';
import {
  Gen,
  randElm,
  randElms,
  randInt,
  range,
  typedKeys,
  unique,
} from 'js_utils';
import { postGeneration } from './specimens';
import { generateClient } from './entitiesGenerators';

//TODO: Validate the generation configuration data
//--------------------Generation configuration start--------------------
const clientsCount = 30;
const privilegedCount = 10;
const bannedCount = 5;
const lockedCount = 8;
const ringtonesCount = 10;
const settingsCount = 8;
const avgChatsCount = 10;
const maxChatMembers = 5;
const avgMessagesCount = 30;
const attachmentsCount = 40;
//--------------------Generation configuration end----------------------

const gen = Gen();
gen.reset();
export function generateData(): Tables {
  const permissions: Named[] = typedKeys(permissionsEnum).map(
    (k) => permissionsEnum[k],
  );

  const clientsIds = range(1, clientsCount);
  const pass = bcrypt.hashSync(DEFAULT_PASSWORD, bcrypt.genSaltSync());
  const clients: Client[] = unique(
    clientsIds.map((id) => generateClient(id)),
    (cl1, cl2) => cl1.email === cl2.email || cl1.username === cl2.username,
  );

  gen.reset();

  const admon = clients[0];

  const assignations: Assignation[] = [
    {
      id: gen.next(),
      client: admon.id,
      permission: permissionsEnum.broadcast.id,
    },
    {
      id: gen.next(),
      client: admon.id,
      permission: permissionsEnum.defaults.id,
    },
    {
      id: gen.next(),
      client: admon.id,
      permission: permissionsEnum.userD_B.id,
    },
    {
      id: gen.next(),
      client: admon.id,
      permission: permissionsEnum.userPrivilege.id,
    },
  ];

  const permissionsIds = permissions.map((permission) => permission.id);

  assignations.push(
    ...unique(
      // starts from the third client for ensuring the
      // existense of a client with no permissions at all
      randElms(clients.slice(2), privilegedCount).reduce<Assignation[]>(
        (ass, client) => {
          let i = 0;
          do {
            ass.push({
              id: gen.next(),
              client: client.id,
              permission: randElm(permissionsIds),
            });
          } while (faker.number.int({ min: 1, max: 100 }) >= 80 && i++ < 5);
          return ass;
        },
        [],
      ),
      (ass1, ass2) =>
        ass1.client === ass2.client && ass1.permission === ass2.permission,
    ),
  );

  gen.reset();

  const banneds: Banned[] = randElms(clients, bannedCount).map((client) => ({
    id: gen.next(),
    client: client.id,
    motive: faker.word.words({ count: { min: 10, max: 15 } }),
  }));

  gen.reset();

  const restrictions: Named[] = typedKeys(restrictionsEnum).map(
    (k) => restrictionsEnum[k],
  );

  const restrictionsIds = restrictions.map((restriction) => restriction.id);

  const locks: Lock[] = unique(
    randElms(clients, lockedCount).reduce<Lock[]>((locks, client) => {
      let i = 0;
      do {
        locks.push({
          restrictor: randElm(clientsIds),
          restricted: client.id,
          restriction: randElm(restrictionsIds),
        });
      } while (faker.number.int({ min: 1, max: 100 }) > 80 && i++ < 4);
      return locks;
    }, []),
    (lock1, lock2) =>
      lock1.restricted === lock2.restricted &&
      lock1.restrictor === lock2.restrictor &&
      lock1.restriction === lock2.restriction,
  );

  const ringtonesIds = range(1, ringtonesCount);
  const ringtones: Ringtone[] = ringtonesIds.map((id) => ({
    id: id,
    name: faker.music.songName(),
    url: faker.internet.url(),
  }));

  const settings: Setting[] = unique(
    range(1, settingsCount).map((_) => ({
      chat_approval: faker.datatype.boolean(),
      discoverability: faker.datatype.boolean(),
      enable_notifications: faker.datatype.boolean(),
      seen_status: faker.datatype.boolean(),
      show_online_status: faker.datatype.boolean(),
      groups_tone: faker.datatype.boolean() ? randElm(ringtonesIds) : undefined,
      notification_tone: faker.datatype.boolean()
        ? randElm(ringtonesIds)
        : undefined,
      client: randElm(clientsIds),
    })),
    (setting1, setting2) => setting1.client === setting2.client,
  );

  const chatIds = range(1, clientsIds.length * avgChatsCount);

  const chats: Chat[] = chatIds.map((id) => ({
    id: id,
    name: faker.datatype.boolean() ? faker.word.noun() : undefined,
    img: faker.datatype.boolean() ? faker.internet.url() : undefined,
    owner: randElm(clientsIds),
    custom_ringtone: faker.datatype.boolean()
      ? randElm(ringtonesIds)
      : undefined,
  }));

  const subscriptions: Subscription[] = chats
    .map<Subscription[]>((chat) => {
      let subs: Subscription[] = [];
      for (let i = 1; i <= maxChatMembers && faker.datatype.boolean(); i++) {
        subs.push({ chat: chat.id, sub: randElm(clientsIds) });
      }
      subs = [{ chat: chat.id, sub: chat.owner }, ...subs];
      subs = unique(
        subs,
        (sub1, sub2) => sub1.chat === sub2.chat && sub1.sub === sub2.sub,
      );
      if (chat.name) {
        return subs;
      }
      if (subs.length === 1) {
        chat.name = clients.find((client) => client.id === chat.owner).username;
      } else if (subs.length === 2) {
        chat.name = clients.find(
          (client) =>
            client.id === subs.find((sub) => sub.sub !== chat.owner).sub,
        ).username;
      } else {
        chat.name = `Group ${chat.id}`;
      }
      return subs;
    })
    .flat();

  gen.reset();

  const messagesIds = range(1, chatIds.length * avgMessagesCount);
  const messages: Message[] = messagesIds.map((id) => {
    const chat = randElm(chats);
    const subcriptions = subscriptions.filter((s) => s.chat === chat.id);
    return {
      id: id,
      chat: chat.id,
      content: faker.word.words({ count: { min: 1, max: 20 } }),
      sender: randElm(subcriptions.map((s) => s.sub)),
      receptionTime: faker.date.future(),
    };
  });

  const attachments: Attachment[] = range(1, attachmentsCount).map((id) => ({
    id: id,
    message: randElm(messagesIds),
    name: `${faker.word.noun()}${
      faker.number.int({ min: 1, max: 100 }) <= 90
        ? `.${faker.system.commonFileExt()}`
        : ''
    }`,
    url: faker.internet.url(),
  }));

  const fakeData = {
    [TablesNames.Permissions]: permissions,
    [TablesNames.Clients]: clients,
    [TablesNames.Assignations]: assignations,
    [TablesNames.Banned]: banneds,
    [TablesNames.Restrictions]: restrictions,
    [TablesNames.Locks]: locks,
    [TablesNames.Ringtones]: ringtones,
    [TablesNames.Settings]: settings,
    [TablesNames.Chats]: chats,
    [TablesNames.Subscriptions]: subscriptions,
    [TablesNames.Messages]: messages,
    [TablesNames.Attachments]: attachments,
  };

  injectPatterns(fakeData, substrings);

  postGeneration(fakeData);

  return fakeData;
}

function injectPatterns(fakeData: Tables, substrings: TablesPatterns) {
  let resultingString: string;
  let originalString: string;
  let index: number;

  typedKeys(substrings).forEach((key) => {
    if (fakeData[key].length === 0) {
      return;
    }

    const chosen = randElms<any>(
      fakeData[key],
      randInt(1, fakeData[key].length),
    );
    for (const elm of chosen) {
      for (const field of substrings[key].fields) {
        if (typeof elm[field] !== 'string') {
          throw new Error(
            'The properties to be injected must be of type string',
          );
        }
        originalString = elm[field];
        index = randInt(0, originalString.length);
        resultingString = `${originalString.substring(0, index)}${substrings[key].pattern}${originalString.substring(index)}`;
        elm[field] = resultingString;
      }
    }
  });
}
