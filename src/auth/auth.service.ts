import {
  BadRequestException,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MODELS, Models, TablesNames } from '../persistence/constants';
import { SignUpDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { Op, Transaction } from 'sequelize';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(TablesNames.Clients) private readonly clients: Models['Clients'],
  ) {}

  async signIn(email: string, pass: string) {
    const user = await this.clients.findOne({ where: { email: email } });
    if (!user || !(await bcrypt.compare(pass, user.dataValues.password))) {
      throw new UnauthorizedException();
    }
    const payload = {
      username: user.dataValues.username,
      id: user.dataValues.id,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpInfo: SignUpDto, transaction?: Transaction) {
    const salt = await bcrypt.genSalt();

    return await this.clients.create(
      {
        username: signUpInfo.username,
        email: signUpInfo.email,
        password: await bcrypt.hash(signUpInfo.password, salt),
      },
      { transaction },
    );
  }
}
