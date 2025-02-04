import { ArrayElement, Gen, StringFields } from 'js_utils';
import { TablesNames } from '../../../src/persistence/constants';
import {
  Assignation,
  Client,
  Lock,
  Attachment,
  Banned,
  Chat,
  Message,
  Named,
  Ringtone,
  Setting,
  Subscription,
  permissionsEnum,
} from '../../../src/persistence/Entities';
import { Contact, Settings, User, Chat as Chatvw } from 'chat-api';

export const DEFAULT_PASSWORD = '123';

export const FAKES_FILE = 'test/fakeData.json';

export type Tables = {
  [TablesNames.Permissions]: Named[];
  [TablesNames.Assignations]: Assignation[];
  [TablesNames.Clients]: Client[];
  [TablesNames.Banned]: Banned[];
  [TablesNames.Restrictions]: Named[];
  [TablesNames.Locks]: Lock[];
  [TablesNames.Ringtones]: Ringtone[];
  [TablesNames.Settings]: Setting[];
  [TablesNames.Chats]: Chat[];
  [TablesNames.Subscriptions]: Subscription[];
  [TablesNames.Messages]: Message[];
  [TablesNames.Attachments]: Attachment[];
};

export type TablesPatterns = {
  [key in keyof Tables]?: {
    pattern: string;
    //fields: (keyof ArrayElement<Tables[key]>)[];
    fields: StringFields<ArrayElement<Tables[key]>>[];
  };
};

export const substrings: TablesPatterns = {
  [TablesNames.Clients]: {
    pattern: 'ac',
    fields: ['email', 'username'],
  },
};

export type View = {
  user: User;
  settings?: Settings;
  chats: Chatvw[];
  contacts: Contact[];
};