import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MODELS, Models } from '../persistence/constants';
import { SignUpDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { Op, Transaction } from 'sequelize';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(MODELS) private models: Models,
  ) {}

  async signIn(email: string, pass: string) {
    const user = await this.models.Clients.findOne({ where: { email: email } });

    if (!user || !(await bcrypt.compare(pass, user.dataValues.password))) {
      throw new UnauthorizedException();
    }
    const payload = {
      username: user.dataValues.username,
      sub: user.dataValues.id,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpInfo: SignUpDto, transaction?: Transaction) {
    const salt = await bcrypt.genSalt();

    return await this.models.Clients.create(
      {
        username: signUpInfo.username,
        email: signUpInfo.email,
        password: await bcrypt.hash(signUpInfo.password, salt),
      },
      { transaction },
    );
  }
}
