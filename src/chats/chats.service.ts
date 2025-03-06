import { Inject, Injectable } from '@nestjs/common';
import { Chat, Client, Message } from '../persistence/Entities';
import { Chat as Chatvw, Contact, Message as Messagevw } from 'chat-api';
import {
  CONTACTS_SERVICE,
  MESSAGES_SERVICE,
  RINGTONES_SERVICE,
} from './constants';
import { ContactsServiceI } from './interfaces/contactsServiceI';
import {
  CHAT_CONTACTS,
  CHAT_MESSAGES,
  CHAT_OWNER,
  CHAT_RINGTONE,
  CHAT_SUBSCRIPTIONS,
  MESSAGE_ATTACHMENTS,
  MESSAGE_SENDER,
  MESSAGES_IDXS,
  MESSAGES_MESSAGES,
  Models,
  SeqModels,
  TablesNames,
} from '../persistence/constants';
import { RingtonesServiceI } from './interfaces/ringtonesServiceI';
import { MessagesServiceI } from './interfaces/messagesServiceI';
import { col, fn, literal, Op, Transaction } from 'sequelize';
import { CrudService } from '../common/crud/crud.services';
import { ChatsPaginationDto } from './dto/chatsPagination.dto';
import { Profile, PROFILE } from '../auth/token_extractors/JwtExtractor';

@Injectable()
export class ChatsService {
  constructor(
    @Inject(CONTACTS_SERVICE)
    private readonly contactsService: ContactsServiceI,
    @Inject(MESSAGES_SERVICE)
    private readonly messagesService: MessagesServiceI,
    @Inject(RINGTONES_SERVICE)
    private readonly ringtonesService: RingtonesServiceI,
    private readonly crud: CrudService,
    @Inject(TablesNames.Chats) private readonly chats: Models['Chats'],
    @Inject(TablesNames.Messages) private readonly messages: Models['Messages'],
    @Inject(TablesNames.Attachments)
    private readonly attachments: Models['Attachments'],
    @Inject(TablesNames.Subscriptions)
    private readonly subs: Models['Subscriptions'],
    @Inject(TablesNames.Assignations)
    private readonly assignations: Models['Assignations'],
    @Inject(TablesNames.Locks)
    private readonly locks: Models['Locks'],
    @Inject(TablesNames.Clients)
    private readonly clients: Models['Clients'],
    @Inject(TablesNames.Ringtones)
    private readonly ringtone: Models['Ringtones'],
  ) {}

  findChatsPage() {}

  chat2view(chat: Chat) {
    const chatvw = {
      id: chat.id,
      img: chat.img,
      name: chat.name,
      subs: (chat[CHAT_CONTACTS] as []).map<Contact>(
        this.contactsService.client2view,
      ),
      messages: chat[CHAT_MESSAGES].map((message) =>
        this.messagesService.message2view(message),
      ),
      owner: this.contactsService.client2view(chat[CHAT_OWNER]),
      ringtone:
        chat[CHAT_RINGTONE] &&
        this.ringtonesService.ringtone2view(chat[CHAT_RINGTONE]),
    } as Chatvw;

    return chatvw;
  }

  arrangeMessage(message: any): Message {
    let msgData: Message;
    msgData = message[MESSAGES_MESSAGES][0];
    msgData[MESSAGE_SENDER] = message[MESSAGE_SENDER];
    msgData[MESSAGE_ATTACHMENTS] = message[MESSAGE_ATTACHMENTS];

    return msgData;
  }

  groupMessages(chatsIds: number[], messages: any[]) {
    const messagesMap = new Map(chatsIds.map((id) => [id, []]));
    for (const message of messages) {
      messagesMap.get(message.dataValues.chat).push(message);
    }
    return messagesMap;
  }

  async getChatViews(
    req,
    chatsPaginationDto: ChatsPaginationDto,
    transaction: Transaction,
  ): Promise<[Chatvw[], boolean]> {
    const [chats, hasMore] = await this.crud.findPage(
      this.chats,
      chatsPaginationDto.paginationInfo,
      {
        transaction,
        replacements: { userId: (req[PROFILE] as Profile).id },
        attributes: ['id', 'name', 'owner', 'custom_ringtone', 'img'],
        having: literal(
          `MAX(IIF(${CHAT_SUBSCRIPTIONS}.sub = :userId, :userId, NULL)) = :userId`,
        ),
        where: chatsPaginationDto.filter && {
          name: { [Op.like]: `%${chatsPaginationDto.filter}%` },
        },
        group: [
          `${TablesNames.Chats}.id`,
          `${TablesNames.Chats}.name`,
          `${TablesNames.Chats}.owner`,
          `${TablesNames.Chats}.custom_ringtone`,
          `${TablesNames.Chats}.img`,
        ],
        include: [
          { model: this.ringtone, subQuery: false, as: CHAT_RINGTONE },
          {
            model: this.subs,
            as: CHAT_SUBSCRIPTIONS,
            subQuery: true,
            required: true,
            duplicating: false,
            attributes: [],
          },
          {
            model: this.clients,
            as: CHAT_OWNER,
            required: true,
            subQuery: false,
            ...(this.contactsService.getContactsQuery(
              req,
              this.assignations,
              this.locks,
            ) as any),
          },
          {
            model: this.clients,
            as: CHAT_CONTACTS,
            required: true,
            subQuery: false,
            ...(this.contactsService.getContactsQuery(
              req,
              this.assignations,
              this.locks,
            ) as any),
          },
        ],
      },
      'id',
    );

    let views: Chatvw[];
    const msgsPerPage = chatsPaginationDto.msgsPerPage || 10;

    if (msgsPerPage <= 0) {
      views = chats.map((chat) => {
        chat.dataValues[CHAT_MESSAGES] = [];
        return this.chat2view(chat.dataValues);
      });

      return [views, hasMore];
    }

    const chatsIds = chats.map((chat) => chat.dataValues.id);

    const messages = await this.messages.findAll({
      transaction,
      replacements: { msgsPerPage },
      subQuery: true,
      where: {
        chat: { [Op.in]: chatsIds },
      },
      attributes: [
        'id',
        'chat',
        'sender',
        [fn('COUNT', col(`${TablesNames.Messages}.id`)), 'idx'],
      ],
      group: [
        `${TablesNames.Messages}.id`,
        `${TablesNames.Messages}.chat`,
        `${TablesNames.Messages}.sender`,
      ],
      having: literal(`COUNT(${TablesNames.Messages}.id) <= :msgsPerPage`),
      order: [
        [{ as: MESSAGES_MESSAGES, model: this.messages }, 'chat', 'ASC'],
        [{ as: MESSAGES_MESSAGES, model: this.messages }, 'id', 'DESC'],
      ],
      include: [
        {
          model: this.messages,
          as: MESSAGES_IDXS,
          required: true,
          subQuery: true,
          duplicating: false,
          attributes: [],
          where: {
            [`$${TablesNames.Messages}.id$`]: {
              [Op.lte]: col(`${MESSAGES_IDXS}.id`),
            },
          },
        },
        {
          model: this.messages,
          as: MESSAGES_MESSAGES,
          required: true,
          subQuery: false,
        } as any,
        {
          model: this.attachments,
          as: MESSAGE_ATTACHMENTS,
          subQuery: false,
        },
        {
          model: this.clients,
          as: MESSAGE_SENDER,
          subQuery: false,
          required: true,
          ...(this.contactsService.getContactsQuery(
            req,
            this.assignations,
            this.locks,
          ) as any),
        },
      ],
    });

    const groupedMessages = this.groupMessages(chatsIds, messages);

    views = chats.map((chat) => {
      chat.dataValues[CHAT_MESSAGES] = groupedMessages
        .get(chat.dataValues.id)
        .map((message) => this.arrangeMessage(message))
        .reverse();
      return this.chat2view(chat.dataValues);
    });

    return [views, hasMore];
  }
}
