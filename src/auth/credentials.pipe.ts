import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SignUpDto } from './auth.dto';
import { Op } from 'sequelize';
import { Models, MODELS } from '../persistence/constants';
import { LanguageService } from '../common/language/language.service';

@Injectable()
export class CredentialsPipe implements PipeTransform {
  constructor(
    @Inject(MODELS) private readonly models: Models,
    private readonly langProvider: LanguageService,
  ) {}

  async transform(
    credentials: { email: string; username: string },
    metadata: ArgumentMetadata,
  ) {
    if (
      !credentials ||
      typeof credentials.email !== 'string' ||
      typeof credentials.username !== 'string'
    ) {
      throw new UnprocessableEntityException();
    }
    let user;
    try {
      user = await this.models.Clients.findOne({
        where: {
          [Op.or]: { email: credentials.email, username: credentials.username },
        },
      });
    } catch (e) {
      console.log(e);
    }

    if (!user) {
      return credentials;
    }

    const erroneousFields: { email?: string; username?: string } = {};

    if (
      user.dataValues.email.toLowerCase() === credentials.email.toLowerCase()
    ) {
      erroneousFields.email = this.langProvider.language.emailNotAvailable;
    }

    if (
      user.dataValues.username.toLowerCase() ===
      credentials.username.toLowerCase()
    ) {
      erroneousFields.username =
        this.langProvider.language.usernameNotAvailable;
    }

    throw new BadRequestException(erroneousFields);
  }
}
