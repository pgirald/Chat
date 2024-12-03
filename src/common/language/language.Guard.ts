import {
  CallHandler,
  CanActivate,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { LanguageService } from './language.service';
import { GuardsConsumer } from '@nestjs/core/guards';

@Injectable()
export class LanguageGuard implements CanActivate {
  constructor(private readonly langProvider: LanguageService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    this.langProvider.setLanguage(context);
    return true;
  }
}
