import {
  Chat as Chatvw,
  Message as Messagevw,
  Contact,
  Ringtone as Ringtonevw,
  User,
  Settings,
  Privileges,
} from 'chat-api';
import {
  Chat,
  Client,
  Message,
  permissionsEnum,
  restrictionsEnum,
  Ringtone,
  Setting,
  Subscription,
} from '../../../../src/persistence/Entities';
import { Tables, View } from '../contants';

export function generateViews(fakeData: Tables) {
  const views: View[] = [];
  let clientSubs: Subscription[];
  let dbChats: Chat[];
  let chats: Chatvw[];
  let contactsPool: Contact[];
  let ringtonesPool: Ringtonevw[];
  let settings: Setting;
  let allChats: Chatvw[];

  ringtonesPool = fakeData.Ringtones.map((ringtone) => ringtone2view(ringtone));

  for (const dbUser of fakeData.Clients) {
    clientSubs = fakeData.Subscriptions.filter(
      (subs) => subs.sub === dbUser.id,
    );

    dbChats = clientSubs.map((subs) =>
      fakeData.Chats.find((chat) => chat.id === subs.chat),
    );

    // contactsPool = unique(
    // 	dbChats
    // 		.map((chat) =>
    // 			fakeData.Subscriptions
    // 				.filter((subs) => subs.chat === chat.id)
    // 				.map((subs) =>
    // 					fakeData.Clients.find((client) => subs.sub === client.id)
    // 				)
    // 				.map((client) => client2view(client, dbUser))
    // 		)
    // 		.flat(),
    // 	(contact1, contact2) => contact1.id === contact2.id
    // );

    contactsPool = fakeData.Clients.map((client) =>
      client2view(client, dbUser),
    );

    allChats = fakeData.Chats.map((chat) => chat2view(chat, dbUser));

    chats = dbChats.map((chat) =>
      allChats.find((_chat) => _chat.id === chat.id),
    );

    settings = fakeData.Settings.find(
      (setting) => setting.client === dbUser.id,
    );

    views.push({
      user: client2user(dbUser),
      settings: settings && setting2view(settings),
      chats: chats,
      contacts: contactsPool,
    });
  }

  const newContacts: Contact[][] = [];

  for (let i = 0; i < views.length; i++) {
    newContacts[i] = views[i].contacts.filter((contact) => {
      const contactVw = views.find((view) => view.user.id === contact.id);
      return !contactVw.contacts.find(
        (contact) => contact.id === views[i].user.id,
      ).blocked;
    });

    if (!views[i].user.permissions.userPrivileges) {
      newContacts[i].forEach((contact) => {
        delete contact.permissions;
      });
    }
  }

  for (let i = 0; i < views.length; i++) {
    views[i].contacts = newContacts[i];
  }

  return views;
  //----------------------------------Function definitions----------------------------------------
  function chat2view(chat: Chat, dbUser: Client) {
    return {
      id: chat.id,
      messages: fakeData.Messages.filter((msg) => msg.chat === chat.id).map(
        (msg) => message2view(msg, dbUser),
      ),
      name: chat.name,
      owner: contactsPool.find((contact) => contact.id === chat.owner),
      subs: fakeData.Subscriptions.filter((subs) => subs.chat === chat.id).map(
        (subs) => contactsPool.find((contact) => subs.sub === contact.id),
      ),
      img: chat.img,
      ringtone:
        chat.custom_ringtone &&
        ringtonesPool.find((ringtone) => ringtone.id === chat.custom_ringtone),
    };
  }

  function message2view(message: Message, dbUser: Client): Messagevw {
    const sender = contactsPool.find(
      (contact) => contact.id === message.sender,
    );
    if (!sender) {
      throw Error('Sender not found');
    }
    return {
      id: message.id,
      content: message.content,
      receptionTime: message.receptionTime,
      attachments: fakeData.Attachments.filter(
        (att) => att.message === message.id,
      ).map((att) => ({ name: att.name, url: att.url })),
      sender: sender,
    };
  }

  function client2view(dbContact: Client, dbUser: Client): Contact {
    const locks = fakeData.Locks.filter(
      (lock) =>
        lock.restrictor === dbUser.id && lock.restricted === dbContact.id,
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
      permissions: getPermissions(dbClient),
    };
  }

  function getPermissions(dbClient: Client): Privileges {
    const assignations = fakeData.Assignations.filter(
      (ass) => ass.client === dbClient.id,
    );
    return {
      broadcast:
        assignations.length > 0 &&
        assignations.some(
          (ass) => ass.permission === permissionsEnum.broadcast.id,
        ),
      defaults:
        assignations.length > 0 &&
        assignations.some(
          (ass) => ass.permission === permissionsEnum.defaults.id,
        ),
      userDeletionBan:
        assignations.length > 0 &&
        assignations.some(
          (ass) => ass.permission === permissionsEnum.userD_B.id,
        ),
      userPrivileges:
        assignations.length > 0 &&
        assignations.some(
          (ass) => ass.permission === permissionsEnum.userPrivilege.id,
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
        (r) => r.id === setting.notification_tone,
      ),
    };
  }
}
