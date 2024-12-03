import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { LanguageService } from 'src/common/language/language.service';

@Injectable()
export class LangMiddleware implements NestMiddleware {

  use(req: Request, res: Response, next: NextFunction) {
    console.log(`-----------------MIDDLEWARE!!!!!-----------------`);
    next();
  }
}
