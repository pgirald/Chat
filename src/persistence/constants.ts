import { Sequelize } from 'sequelize';
import { defineModels } from './models';

export const MODELS = 'MODELS';

export const FREER = 'FREER';

export const SEQUELIZE = 'sequelize';

export type Models = ReturnType<typeof defineModels> & {
  sequelize: Sequelize;
};

export const TablesNames = {
  Permissions: 'Permissions' as 'Permissions',
  Clients: 'Clients' as 'Clients',
  Assignations: 'Assignations' as 'Assignations',
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

export const PERMISSIONS = 'permissions_alias';

export const ASSIGNATIONS = 'assignations_alias';

export const RESTRICTED_LOCKS = 'restricted_locks_alias';
