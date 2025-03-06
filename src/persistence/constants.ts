import { Model, ModelStatic, Sequelize } from 'sequelize';
import { defineModels } from './models';

export const MODELS = 'MODELS';

export const RELEASER = 'RELEASER';

export const SEQUELIZE = 'sequelize';

export type Models = ReturnType<typeof defineModels> & {
  sequelize: Sequelize;
};

type Generic<T extends Model> = ModelStatic<T>;
type ExtractTypeParameter<T> = T extends Generic<infer U> ? U : never;

export type SeqModels = {
  [key in keyof Omit<Models, 'sequelize'>]: ExtractTypeParameter<Models[key]>;
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

export const RESTRICTOR_CONTACTS = 'restrictor_contacts_alias';

export const RESTRICTED_CONTACTS = 'restricted_contacts_alias';

export const CLIENT_SUBSCRIPTIONS = 'clients_subscriptions_alias';

export const SUBSCRIPTION_CLIENT = 'subscription_client_alias';

export const CHAT_SUBSCRIPTIONS = 'chat_subscriptions_alias';

export const CHAT_OWNER = 'chat_owner_alias';

export const OWNED_CHATS = 'owned_chats_alias';

export const CHAT_CONTACTS = 'chat_contacts_alias';

export const CONTACT_CHATS = 'contact_chats_alias';

export const CHAT_MESSAGES = 'chat_messages_alias';

export const CHAT_RINGTONE = 'chat_ringtone_alias';

export const MESSAGE_ATTACHMENTS = 'message_attachments_alias';

export const MESSAGES_IDXS = 'messages_idxs_alias';

export const MESSAGES_MESSAGES = 'messages_messages_alias';

export const MESSAGE_SENDER = 'messages_sender_alias';

export const USERNAME_REGEX = /^([_.-]?[A-Za-z0-9]){0,50}$/;

export const CHAT_NAME_REGEX = /^([_.-]?[A-Za-z0-9 ]){0,50}$/;
