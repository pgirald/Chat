import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { LanguageGuard } from '../../../../src/common/language/language.Guard';
import { LanguageService } from '../../../../src/common/language/language.service';

@UseGuards(LanguageGuard)
@Controller('language')
export class LanguageController {
  constructor(private readonly langProvider: LanguageService) {}

  @Get()
  lang() {
    return this.langProvider.language.lang;
  }
}
