import { faker } from "@faker-js/faker";
import {
	Assignation,
	Attachment,
	Banned,
	Chat,
	Client,
	Lock,
	Message,
	Named,
	Reception,
	Ringtone,
	Setting,
	Subscription,
} from "../../src/db/Entities.js";
import {
	Gen,
	randElm,
	range,
	typedKeys,
	unique,
} from "../../src/utils/general.js";
import {
	Roles,
	Permissions,
	Assignations,
	Clients,
	Banned as DbBanned,
	Restrictions,
	Locks,
	Ringtones,
	Settings,
	Chats,
	Subscriptions,
	Messages,
	Receptions,
	Attachments,
} from "../src/Data_Source.js";

const gen = Gen();
export const rolesEnum = {
	admon: { id: gen.next(), name: "Admon" },
	publisher: { id: gen.next(), name: "Publisher" },
	moderator: { id: gen.next(), name: "Moderator" },
};

const roles: Named[] = typedKeys(rolesEnum).map((k) => rolesEnum[k]);
const rolesIds = roles.map((r) => r.id);

gen.reset();
export const permissionsEnum = {
	defaults: { id: gen.next(), name: "Defaults" },
	broadcast: { id: gen.next(), name: "Broadcast" },
	userD_B: { id: gen.next(), name: "User deletion/ban" },
	userPrivilege: { id: gen.next(), name: "User privilege" },
};

gen.reset();
export const restrictionsEnum = {
	mute: { id: gen.next(), name: "Mute" },
	block: { id: gen.next(), name: "Block" },
};

export function generateData() {
	const permissions: Named[] = typedKeys(permissionsEnum).map(
		(k) => permissionsEnum[k]
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
		(ass1, ass2) => ass1.permission == ass2.permission && ass1.role == ass2.role
	);

	const clientsIds = range(1, 40);
	const clients: Client[] = unique(
		clientsIds.map((id) => ({
			id: id,
			email: faker.internet.email(),
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName(),
			phone_number: faker.phone.number(),
			username: faker.internet.userName(),
			password: "123",
			about_me: faker.word.words({ count: { min: 0, max: 10 } }) || undefined,
			role: faker.datatype.boolean() ? randElm(rolesIds) : undefined,
			img: faker.datatype.boolean() ? faker.internet.url() : undefined,
		})),
		(cl1, cl2) => cl1.email === cl2.email || cl1.username === cl2.username
	);

	const banneds: Banned[] = unique(
		range(1, 5).map((id) => ({
			id: id,
			client: randElm(clientsIds),
			motive: faker.word.words({ count: { min: 10, max: 15 } }),
		})),
		(ban1, ban2) => ban1.client == ban2.client
	);

	const restrictions: Named[] = typedKeys(restrictionsEnum).map(
		(k) => restrictionsEnum[k]
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
			lock1.restriction === lock2.restriction
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
		(setting1, setting2) => setting1.client === setting2.client
	);

	const chatIds = range(1, 800);
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
		(sub1, sub2) => sub1.chat === sub2.chat && sub1.sub === sub2.sub
	);

	gen.reset();
	const receptions: Reception[] = [];

	const messagesIds = range(1, 50000);
	const messages: Message[] = messagesIds.map((id) => {
		const chat = randElm(chats);
		const subcriptions = subscriptions.filter((s) => s.chat === chat.id);
		for (const subscription of subcriptions) {
			receptions.push({
				id: gen.next(),
				time: faker.date.future(),
				message: id,
				receipt: subscription.sub,
			});
		}
		return {
			id: id,
			chat: chat.id,
			content: faker.word.words({ count: { min: 1, max: 20 } }),
			sender: randElm(subcriptions.map((s) => s.sub)),
		};
	});

	const attachments: Attachment[] = range(1, 1000).map((id) => ({
		id: id,
		message: randElm(messagesIds),
		name: `${faker.word.noun()}${
			faker.number.int({ min: 1, max: 100 }) <= 90
				? `.${faker.system.commonFileExt()}`
				: ""
		}`,
		url: faker.internet.url(),
	}));

	return {
		roles,
		permissions,
		assignations,
		clients,
		banneds,
		restrictions,
		locks,
		ringtones,
		settings,
		chats,
		subscriptions,
		messages,
		receptions,
		attachments,
	};
}

export type Tables = ReturnType<typeof generateData>;
export type TablesMap = { [prop in keyof Tables]: any };

export const dbMap = {
	roles: Roles,
	permissions: Permissions,
	assignations: Assignations,
	clients: Clients,
	banneds: DbBanned,
	restrictions: Restrictions,
	locks: Locks,
	ringtones: Ringtones,
	settings: Settings,
	chats: Chats,
	subscriptions: Subscriptions,
	messages: Messages,
	receptions: Receptions,
	attachments: Attachments,
};
