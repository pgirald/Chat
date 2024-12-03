import { ExecutionContext } from '@nestjs/common';
import { Language } from '../interfaces';
import { LangExtractor } from './LangExtractor';

export class SocketIoLangExtractor implements LangExtractor {
  extract(context: ExecutionContext): Language | undefined {
    const langTag = context.getArgs()[1].lang;
    return LangExtractor.findLanguage(langTag);
  }
}

export const IoLangExtractorProvider = {
  provide: LangExtractor,
  useClass: SocketIoLangExtractor,
};
