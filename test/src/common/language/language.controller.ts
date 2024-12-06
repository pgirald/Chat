import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { LanguageGuard } from '../../../../src/common/language/language.Guard';
import { LanguageService } from '../../../../src/common/language/language.service';
import { Public } from '../../../../src/auth/decorators/public.decorator';

@UseGuards(LanguageGuard)
@Controller('language')
export class LanguageController {
  constructor(private readonly langProvider: LanguageService) {}

  @Get()
  @Public()
  lang() {
    return this.langProvider.language.lang;
  }
}
