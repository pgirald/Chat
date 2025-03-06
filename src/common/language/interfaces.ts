import {
  IS_EMAIL,
  IS_INT,
  IS_POSITIVE,
  IS_STRONG_PASSWORD,
} from 'class-validator';
import { IS_USERNAME } from 'src/auth/validators/isUsername';
import { IS_UNDER_PAGE_LIMIT } from '../crud/isUnderPageLimit';
import { IS_CONTACTS_FILTER } from '../../contacts/validators/isContactFilter';
import { IS_CHAT_NAME } from '../..//chats/validators/isChatName';

export interface Language {
  lang: string;
  usernameNotAvailable: string;
  emailNotAvailable: string;
  group: string;
  validation: {
    [IS_EMAIL]: string;
    [IS_STRONG_PASSWORD]: string;
    [IS_USERNAME]: string;
    [IS_CONTACTS_FILTER]: string;
    [IS_INT]: string;
    [IS_POSITIVE]: string;
    [IS_UNDER_PAGE_LIMIT]: string;
    [IS_CHAT_NAME]: string;
    getDefault(property: string): string;
  };
  status: {
    [key: number]: string;
    unknown: string;
  };
}
