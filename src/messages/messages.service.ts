import { Inject, Injectable } from '@nestjs/common';
import { Attachment, Message } from '../persistence/Entities';
import { Message as Messagevw, Attachment as Attachmentvw } from 'chat-api';
import { MESSAGE_ATTACHMENTS, MESSAGE_SENDER } from '../persistence/constants';
import { ContactsServiceI } from './interfaces/contactsServiceI';
import { CONTACTS_SERVICE } from './constants';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(CONTACTS_SERVICE)
    private readonly contactsService: ContactsServiceI,
  ) {}

  message2view(message: Message): Messagevw {
    return {
      id: message.id,
      content: message.content,
      receptionTime: message.receptionTime,
      attachments: message[MESSAGE_ATTACHMENTS].map(this.attachment2view),
      sender: this.contactsService.client2view(message[MESSAGE_SENDER]),
    };
  }

  attachment2view(attachment: Attachment): Attachmentvw {
    return { name: attachment.name, url: attachment.url };
  }
}
