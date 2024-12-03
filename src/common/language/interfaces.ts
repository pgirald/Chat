import { IS_EMAIL, IS_STRONG_PASSWORD } from 'class-validator';
import { IS_USERNAME } from 'src/auth/validators/isUsername';

export interface Language {
  lang: string;
  usernameNotAvailable: string;
  emailNotAvailable: string;
  validation: {
    [IS_EMAIL]: string;
    [IS_STRONG_PASSWORD]: string;
    [IS_USERNAME]: string;
    getDefault(property: string): string;
  };
  status: {
    [key: number]: string;
    unknown: string;
  };
}
