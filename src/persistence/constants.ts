import { Sequelize } from 'sequelize';
import { dbmodels } from './source';

export const MODELS = 'MODELS';

export type Models = typeof dbmodels & {
  sequelize: Sequelize;
};

export const TablesNames = {
  Roles: 'Roles' as const,
  Permissions: 'Permissions' as const,
  Assignations: 'Assignations' as const,
  Clients: 'Clients' as const,
  Banned: 'Banned' as const,
  Restrictions: 'Restrictions' as const,
  Locks: 'Locks' as const,
  Ringtones: 'Ringtones' as const,
  Settings: 'Settings' as const,
  Chats: 'Chats' as const,
  Subscriptions: 'Subscriptions' as const,
  Messages: 'Messages' as const,
  Attachments: 'Attachments' as const,
};
