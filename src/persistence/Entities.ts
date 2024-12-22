export type Named = { id: number; name: string };

export type Assignation = { id: number; client: number; permission: number };

export type Client = {
  id: number;
  username: string;
  email: string;
  password: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  about_me?: string;
  img?: string;
};

export type Banned = {
  id: number;
  motive: string;
  client: number;
};

export type Lock = {
  restrictor: number;
  restricted: number;
  restriction: number;
};

export type Ringtone = Named & {
  url: string;
};

export type Setting = {
  enable_notifications: boolean;
  seen_status: boolean;
  show_online_status: boolean;
  discoverability: boolean;
  chat_approval: boolean;
  client: number;
  notification_tone?: number;
  groups_tone?: number;
};

export type Chat = {
  id: number;
  name?: string;
  img?: string;
  owner: number;
  custom_ringtone?: number;
};

export type Message = {
  id: number;
  content: string;
  sender: number;
  chat: number;
  receptionTime: Date;
};

export type Attachment = {
  id: number;
  name: string;
  url: string;
  message: number;
};

export type Subscription = {
  sub: number;
  chat: number;
};

export const permissionsEnum = {
  defaults: { id: 1, name: 'Defaults' },
  broadcast: { id: 2, name: 'Broadcast' },
  userD_B: { id: 3, name: 'User deletion/ban' },
  userPrivilege: { id: 4, name: 'User privilege' },
};

export const restrictionsEnum = {
  mute: { id: 1, name: 'Mute' },
  block: { id: 2, name: 'Block' },
};
