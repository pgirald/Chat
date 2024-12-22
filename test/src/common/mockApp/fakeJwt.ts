import { JwtService } from '@nestjs/jwt';
import { FAKE_EXPIRATION, FAKE_SECRET } from './constants';
import { fakeData } from '../../persistence/FakeData';

const jwtService = new JwtService({ secret: FAKE_SECRET });

export const fakeJwt = jwtService.sign(
  {
    username: fakeData.Clients[0].username,
    id: fakeData.Clients[0].id,
  },
  { expiresIn: FAKE_EXPIRATION },
);
