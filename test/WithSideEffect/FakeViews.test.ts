import * as fs from "fs";
import { permissionsEnum, restrictionsEnum, Tables } from "../src/FakeData";
import {
	Chat as Chatvw,
	Message as Messagevw,
	Contact,
	Role as Rolevw,
	Ringtone as Ringtonevw,
	User,
	Settings,
} from "chat-api";
import {
	Chat,
	Client,
	Message,
	Named,
	Ringtone,
	Setting,
	Subscription,
} from "../../src/persistence/Entities";
import { unique } from "../../src/utils/general";
import { stringify } from "flatted";

test.each<[string, string]>([["tests/fakeData.json", "tests/fakeViews.json"]])(
	"Generate fake views",
	(fakesFile, outFile) => {
		const fakeData: Tables = JSON.parse(fs.readFileSync(fakesFile).toString());
		const views: {
			user: User;
			settings?: Settings;
			chats: Chatvw[];
			contacts: Contact[];
		}[] = [];
		let clientSubs: Subscription[];
		let dbChats: Chat[];
		let chats: Chatvw[];
		let contactsPool: Contact[];
		let rolesPool: Rolevw[];
		let ringtonesPool: Ringtonevw[];
		let settings: Setting;
		let allChats: Chatvw[];

		rolesPool = fakeData.roles.map((role) => role2view(role));

		ringtonesPool = fakeData.ringtones.map((ringtone) =>
			ringtone2view(ringtone)
		);

		for (const dbUser of fakeData.clients) {
			clientSubs = fakeData.subscriptions.filter(
				(subs) => subs.sub === dbUser.id
			);

			dbChats = clientSubs.map((subs) =>
				fakeData.chats.find((chat) => chat.id === subs.chat)
			);

			// contactsPool = unique(
			// 	dbChats
			// 		.map((chat) =>
			// 			fakeData.subscriptions
			// 				.filter((subs) => subs.chat === chat.id)
			// 				.map((subs) =>
			// 					fakeData.clients.find((client) => subs.sub === client.id)
			// 				)
			// 				.map((client) => client2view(client, dbUser))
			// 		)
			// 		.flat(),
			// 	(contact1, contact2) => contact1.id === contact2.id
			// );

			contactsPool = fakeData.clients.map((client) =>
				client2view(client, dbUser)
			);

			allChats = fakeData.chats.map((chat) => chat2view(chat, dbUser));

			chats = dbChats.map((chat) =>
				allChats.find((_chat) => _chat.id === chat.id)
			);

			settings = fakeData.settings.find(
				(setting) => setting.client === dbUser.id
			);

			views.push({
				user: client2user(dbUser),
				settings: settings && setting2view(settings),
				chats: chats,
				contacts: contactsPool,
			});
		}

		fs.writeFileSync(outFile, stringify(views), { flag: "w" });
		console.log(
			"------------------------------------------File written succesfully------------------------------------------"
		);
		//----------------------------------Function definitions----------------------------------------
		function chat2view(chat: Chat, dbUser: Client) {
			return {
				id: chat.id,
				messages: fakeData.messages
					.filter((msg) => msg.chat === chat.id)
					.map((msg) => message2view(msg, dbUser)),
				name: chat.name,
				owner: contactsPool.find((contact) => contact.id === chat.owner),
				subs: fakeData.subscriptions
					.filter((subs) => subs.chat === chat.id)
					.map((subs) =>
						contactsPool.find((contact) => subs.sub === contact.id)
					),
				img: chat.img,
				ringtone:
					chat.custom_ringtone &&
					ringtonesPool.find(
						(ringtone) => ringtone.id === chat.custom_ringtone
					),
			};
		}

		function message2view(message: Message, dbUser: Client): Messagevw {
			const sender = contactsPool.find(
				(contact) => contact.id === message.sender
			);
			if (!sender) {
				throw Error("Sender not found");
			}
			return {
				id: message.id,
				content: message.content,
				receptionTime: message.receptionTime,
				attachments: fakeData.attachments
					.filter((att) => att.message === message.id)
					.map((att) => ({ name: att.name, url: att.url })),
				sender: sender,
			};
		}

		function client2view(dbContact: Client, dbUser: Client): Contact {
			const locks = fakeData.locks.filter(
				(lock) =>
					lock.restrictor === dbUser.id && lock.restricted === dbContact.id
			);

			return {
				blocked:
					locks.length > 0 &&
					locks.some((lock) => lock.restriction === restrictionsEnum.block.id),
				muted:
					locks.length > 0 &&
					locks.some((lock) => lock.restriction === restrictionsEnum.mute.id),
				...client2user(dbContact),
			};
		}

		function client2user(dbClient: Client): User {
			return {
				id: dbClient.id,
				email: dbClient.email,
				firstName: dbClient.first_name,
				lastName: dbClient.last_name,
				phoneNumber: dbClient.phone_number,
				username: dbClient.username,
				aboutMe: dbClient.about_me,
				img: dbClient.img,
				role:
					dbClient.role && rolesPool.find((role) => role.id === dbClient.role),
			};
		}

		function role2view(role: Named): Rolevw {
			const dbRole = fakeData.roles.find((rl) => rl.id === role.id);
			const assignations = fakeData.assignations.filter(
				(ass) => ass.role === dbRole.id
			);
			return {
				id: role.id,
				name: dbRole.name,
				broadcast:
					assignations.length > 0 &&
					assignations.some(
						(ass) => ass.permission === permissionsEnum.broadcast.id
					),
				defaults:
					assignations.length > 0 &&
					assignations.some(
						(ass) => ass.permission === permissionsEnum.defaults.id
					),
				userDeletionBan:
					assignations.length > 0 &&
					assignations.some(
						(ass) => ass.permission === permissionsEnum.userD_B.id
					),
				userPrivileges:
					assignations.length > 0 &&
					assignations.some(
						(ass) => ass.permission === permissionsEnum.userPrivilege.id
					),
			};
		}

		function ringtone2view(dbRingtone: Ringtone): Ringtonevw {
			return {
				id: dbRingtone.id,
				name: dbRingtone.name,
				url: dbRingtone.url,
			};
		}

		function setting2view(setting: Setting): Settings {
			return {
				chatApproval: setting.chat_approval,
				discoverability: setting.discoverability,
				enableNotifications: setting.enable_notifications,
				seenStatus: setting.seen_status,
				showOnlineStatus: setting.show_online_status,
				groupsTone: ringtonesPool.find((r) => r.id === setting.groups_tone),
				notificationTone: ringtonesPool.find(
					(r) => r.id === setting.notification_tone
				),
			};
		}
	}
);
