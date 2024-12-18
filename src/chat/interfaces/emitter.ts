import { PrivateMessageDto } from './events.dto';

export const events = {
  connection: 'connection',
  privateMessage: 'private message',
};

export interface Emitter {
  initialize: (server: any) => void;

  handleConnection: (client: any) => Promise<any>;

  sendMessage: (privateMessage: PrivateMessageDto) => Promise<any>;
}
