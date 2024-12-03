import { ExecutionContext, NotImplementedException } from '@nestjs/common';
import { Language } from '../interfaces';
import { english, spanish } from '../constants';

export class LangExtractor {
  extract(context: ExecutionContext): Language | undefined {
    throw new NotImplementedException();
  }

  static findLanguage(tag: any): Language | undefined {
    switch (tag) {
      case 'en':
        return english;

      case 'es':
        return spanish;

      default:
        return undefined;
    }
  }
}
