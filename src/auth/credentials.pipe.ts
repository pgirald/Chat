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

@Injectable()
export class CredentialsPipe implements PipeTransform {
  constructor(@Inject(MODELS) private models: Models) {}

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

    const erroneousFiels: { email?: string; username?: string } = {};

    if (
      user.dataValues.email.toLowerCase() === credentials.email.toLowerCase()
    ) {
      erroneousFiels.email = 'The given email is aready registered.';
    }

    if (
      user.dataValues.username.toLowerCase() ===
      credentials.username.toLowerCase()
    ) {
      erroneousFiels.username = 'The given username is aready registered.';
    }

    throw new BadRequestException(erroneousFiels);
  }
}
