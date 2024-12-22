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
} from '../../../src/persistence/Entities';

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
