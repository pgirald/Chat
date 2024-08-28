export type Entity = "Contact" | "Chats";

export type Named = { id: number; name: string };

export type Assignation = { id: number; role: number; permission: number };

export type Client = {
	id: number;
	username: string;
	email: string;
	password: string;
	country_code: string;
	phone_number: string;
	first_name: string;
	last_name: string;
	about_me?: string;
	role?: number;
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
	blob: Buffer;
};

export type Setting = {
	id: number;
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
	owner: number;
	custom_ringtone?: number;
};

export type Message = {
	id: number;
	content: string;
	time: Date;
	sender: number;
	chat: number;
};

export type Attachment = {
	id: number;
	name: string;
	blob: Buffer;
	message: number;
};

export type Subscription = {
	sub: number;
	chat: number;
};
