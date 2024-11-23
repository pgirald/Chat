import { Sequelize } from 'sequelize';
import { dbmodels } from './source';

export const MODELS = 'MODELS';

export type Models = typeof dbmodels & {
  sequelize: Sequelize;
};

export const TablesNames = {
  Roles: 'Roles' as 'Roles',
  Permissions: 'Permissions' as 'Permissions',
  Assignations: 'Assignations' as 'Assignations',
  Clients: 'Clients' as 'Clients',
  Banned: 'Banned' as 'Banned',
  Restrictions: 'Restrictions' as 'Restrictions',
  Locks: 'Locks' as 'Locks',
  Ringtones: 'Ringtones' as 'Ringtones',
  Settings: 'Settings' as 'Settings',
  Chats: 'Chats' as 'Chats',
  Subscriptions: 'Subscriptions' as 'Subscriptions',
  Messages: 'Messages' as 'Messages',
  Attachments: 'Attachments' as 'Attachments',
};
