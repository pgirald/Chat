import {
  IS_EMAIL,
  IS_INT,
  IS_POSITIVE,
  IS_STRONG_PASSWORD,
} from 'class-validator';
import { IS_USERNAME } from 'src/auth/validators/isUsername';
import { IS_CONTACTS_FILTER } from 'src/contacts/isContactFilter';
import { IS_UNDER_PAGE_LIMIT } from '../crud/isUnderPageLimit';

export interface Language {
  lang: string;
  usernameNotAvailable: string;
  emailNotAvailable: string;
  validation: {
    [IS_EMAIL]: string;
    [IS_STRONG_PASSWORD]: string;
    [IS_USERNAME]: string;
    [IS_CONTACTS_FILTER]: string;
    [IS_INT]: string;
    [IS_POSITIVE]: string;
    [IS_UNDER_PAGE_LIMIT]: string;
    getDefault(property: string): string;
  };
  status: {
    [key: number]: string;
    unknown: string;
  };
}
