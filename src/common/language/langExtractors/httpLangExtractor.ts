import { ExecutionContext } from '@nestjs/common';
import { Language } from '../interfaces';
import { LangExtractor } from './LangExtractor';
import { Request } from 'express';

export class HttpLangExtractor implements LangExtractor {
  extract(context: ExecutionContext): Language | undefined {
    const request: Request = context.switchToHttp().getRequest();
    const langTag = request.headers['accept-language'];
    return LangExtractor.findLanguage(langTag);
  }
}

export const HttpLangExtractorProvider = {
  provide: LangExtractor,
  useClass: HttpLangExtractor,
};
