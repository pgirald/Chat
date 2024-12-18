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
  Ringtone,
  Setting,
  Subscription,
} from '../../../src/persistence/Entities';
import {
  Gen,
  randElm,
  range,
  typedKeys,
  unique,
} from '../../../src/utils/general';
import * as bcrypt from 'bcrypt';
import { TablesNames } from '../../../src/persistence/constants';
import { defaultPassword, Tables } from './contants';

const gen = Gen();
export const rolesEnum = {
  admon: { id: gen.next(), name: 'Admon' },
  publisher: { id: gen.next(), name: 'Publisher' },
  moderator: { id: gen.next(), name: 'Moderator' },
};

const roles: Named[] = typedKeys(rolesEnum).map((k) => rolesEnum[k]);
const rolesIds = roles.map((r) => r.id);

gen.reset();
export const permissionsEnum = {
  defaults: { id: gen.next(), name: 'Defaults' },
  broadcast: { id: gen.next(), name: 'Broadcast' },
  userD_B: { id: gen.next(), name: 'User deletion/ban' },
  userPrivilege: { id: gen.next(), name: 'User privilege' },
};

gen.reset();
export const restrictionsEnum = {
  mute: { id: gen.next(), name: 'Mute' },
  block: { id: gen.next(), name: 'Block' },
};

export function generateData(): Tables {
  const permissions: Named[] = typedKeys(permissionsEnum).map(
    (k) => permissionsEnum[k],
  );
  const permissionsIds = permissions.map((p) => p.id);

  gen.reset();
  const assignations: Assignation[] = unique(
    [
      {
        id: gen.next(),
        permission: permissionsEnum.broadcast.id,
        role: rolesEnum.admon.id,
      },
      {
        id: gen.next(),
        permission: permissionsEnum.defaults.id,
        role: rolesEnum.admon.id,
      },
      {
        id: gen.next(),
        permission: permissionsEnum.userD_B.id,
        role: rolesEnum.admon.id,
      },
      {
        id: gen.next(),
        permission: permissionsEnum.userPrivilege.id,
        role: rolesEnum.admon.id,
      },
      {
        id: gen.next(),
        permission: permissionsEnum.broadcast.id,
        role: rolesEnum.publisher.id,
      },
      {
        id: gen.next(),
        permission: permissionsEnum.userD_B.id,
        role: rolesEnum.moderator.id,
      },
    ],
    (ass1, ass2) =>
      ass1.permission == ass2.permission && ass1.role == ass2.role,
  );

  const clientsIds = range(1, 5);
  const pass = bcrypt.hashSync(defaultPassword, bcrypt.genSaltSync());
  const clients: Client[] = unique(
    clientsIds.map((id) => ({
      id: id,
      email: faker.internet.email(),
      first_name: faker.datatype.boolean()
        ? faker.person.firstName()
        : undefined,
      last_name: faker.datatype.boolean() ? faker.person.lastName() : undefined,
      phone_number: faker.phone.number(),
      username: faker.internet.userName(),
      password: pass,
      about_me: faker.word.words({ count: { min: 0, max: 10 } }) || undefined,
      role: faker.datatype.boolean() ? randElm(rolesIds) : undefined,
      img: faker.datatype.boolean() ? faker.internet.url() : undefined,
    })),
    (cl1, cl2) => cl1.email === cl2.email || cl1.username === cl2.username,
  );

  const banneds: Banned[] = unique(
    range(1, 5).map((id) => ({
      id: id,
      client: randElm(clientsIds),
      motive: faker.word.words({ count: { min: 10, max: 15 } }),
    })),
    (ban1, ban2) => ban1.client == ban2.client,
  );

  const restrictions: Named[] = typedKeys(restrictionsEnum).map(
    (k) => restrictionsEnum[k],
  );

  const restrictionsIds = restrictions.map((res) => res.id);

  const locks: Lock[] = unique(
    range(1, 10).map(() => ({
      restrictor: randElm(clientsIds),
      restricted: randElm(clientsIds),
      restriction: randElm(restrictionsIds),
    })),
    (lock1, lock2) =>
      lock1.restricted === lock2.restricted &&
      lock1.restrictor === lock2.restrictor &&
      lock1.restriction === lock2.restriction,
  );

  const ringtonesIds = range(1, 10);
  const ringtones: Ringtone[] = ringtonesIds.map((id) => ({
    id: id,
    name: faker.music.songName(),
    url: faker.internet.url(),
  }));

  const settings: Setting[] = unique(
    range(1, 8).map((_) => ({
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

  const chatIds = range(1, 50);
  const chats: Chat[] = chatIds.map((id) => ({
    id: id,
    name: faker.datatype.boolean() ? faker.word.noun() : undefined,
    img: faker.datatype.boolean() ? faker.internet.url() : undefined,
    owner: randElm(clientsIds),
    custom_ringtone: faker.datatype.boolean()
      ? randElm(ringtonesIds)
      : undefined,
  }));

  const subscriptions: Subscription[] = unique(
    chats
      .map<Subscription[]>((chat) => {
        const subs: Subscription[] = [];
        for (let i = 1; i <= 4 && faker.datatype.boolean(); i++) {
          subs.push({ chat: chat.id, sub: randElm(clientsIds) });
        }
        return [{ chat: chat.id, sub: chat.owner }, ...subs];
      })
      .flat(),
    (sub1, sub2) => sub1.chat === sub2.chat && sub1.sub === sub2.sub,
  );

  gen.reset();

  const messagesIds = range(1, 1000);
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

  const attachments: Attachment[] = range(1, 50).map((id) => ({
    id: id,
    message: randElm(messagesIds),
    name: `${faker.word.noun()}${
      faker.number.int({ min: 1, max: 100 }) <= 90
        ? `.${faker.system.commonFileExt()}`
        : ''
    }`,
    url: faker.internet.url(),
  }));

  return {
    [TablesNames.Roles]: roles,
    [TablesNames.Permissions]: permissions,
    [TablesNames.Assignations]: assignations,
    [TablesNames.Clients]: clients,
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
}
