import * as fs from "fs";
import {
	permissionsEnum,
	restrictionsEnum,
	rolesEnum,
	Tables,
} from "../src/FakeData";
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
} from "../../src/db/Entities";

test.each<[string, string]>([["tests/fakeData.json", "tests/fakeViews.json"]])(
	"Generate fake views",
	(fakesFile, outFile) => {
		const fakeData: Tables = JSON.parse(fs.readFileSync(fakesFile).toString());
		const views: { user: User; settings?: Settings; chats: Chatvw[] }[] = [];
		let clientSubs: Subscription[];
		let dbChats: Chat[];
		let chats: Chatvw[];
		let settings: Setting;
		for (const dbUser of fakeData.clients) {
			clientSubs = fakeData.subscriptions.filter(
				(subs) => subs.sub === dbUser.id
			);
			dbChats = clientSubs.map((subs) =>
				fakeData.chats.find((chat) => chat.id === subs.chat)
			);
			chats = dbChats.map((chat) => ({
				id: chat.id,
				messages: fakeData.messages
					.filter((msg) => msg.chat === chat.id)
					.map((msg) => message2view(msg, dbUser)),
				name: chat.name,
				owner: client2view(
					fakeData.clients.find((client) => client.id === chat.owner),
					dbUser
				),
				subs: clientSubs
					.filter((subs) => subs.chat === chat.id)
					.map((subs) =>
						fakeData.clients.find((client) => subs.sub === client.id)
					)
					.map((client) => client2view(client, dbUser)),
				img: chat.img,
				ringtone:
					chat.custom_ringtone &&
					ringtone2view(
						fakeData.ringtones.find((tone) => tone.id === chat.custom_ringtone)
					),
			}));
			settings = fakeData.settings.find(
				(setting) => setting.client === dbUser.id
			);
			views.push({
				user: client2user(dbUser),
				settings: settings && setting2view(settings),
				chats: chats,
			});
		}

		fs.writeFileSync(outFile, JSON.stringify(views));
		console.log(
			"------------------------------------------File written succesfully------------------------------------------"
		);
		//----------------------------------Function definitions----------------------------------------
		function message2view(message: Message, dbUser: Client): Messagevw {
			return {
				id: message.id,
				content: message.content,
				receptionTime: fakeData.receptions.find(
					(recp) => recp.message === message.id && recp.receipt === dbUser.id
				).time,
				attachments: fakeData.attachments
					.filter((att) => att.message === message.id)
					.map((att) => ({ name: att.name, url: att.url })),
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
					dbClient.role &&
					role2view(fakeData.roles.find((role) => role.id === dbClient.role)),
			};
		}

		function role2view(role: Named): Rolevw {
			const dbRole = fakeData.roles.find((rl) => rl.id === role.id);
			const assignations = fakeData.assignations.filter(
				(ass) => ass.role === dbRole.id
			);
			return {
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
			return { name: dbRingtone.name, url: dbRingtone.url };
		}

		function setting2view(setting: Setting): Settings {
			return {
				chatApproval: setting.chat_approval,
				discoverability: setting.discoverability,
				enableNotifications: setting.enable_notifications,
				seenStatus: setting.seen_status,
				showOnlineStatus: setting.show_online_status,
				groupsTone: setting.groups_tone,
				notificationTone: setting.notification_tone,
			};
		}
	}
);
