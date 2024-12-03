import { ExecutionContext, Injectable } from '@nestjs/common';
import { Language } from './interfaces';
import { english } from './constants';
import { LangExtractor } from './langExtractors/langExtractor';

@Injectable()
export class LanguageService {
  private _language?: Language;

  constructor(private readonly langExtractor: LangExtractor) {}

  setLanguage(context: ExecutionContext) {
    this._language = this.langExtractor?.extract(context);
  }

  get language(): Language {
    return this._language || english;
  }
}
