import { Message } from '../../persistence/Entities';
import { Message as Messagevw } from 'chat-api';

export interface MessagesServiceI {
  message2view(message: Message): Messagevw;
}
