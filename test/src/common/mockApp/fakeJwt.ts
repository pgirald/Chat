import { JwtService } from '@nestjs/jwt';
import { FAKE_EXPIRATION, FAKE_SECRET } from './constants';
import { fakeClient } from '../../../src/persistence/FakeData';

const jwtService = new JwtService({ secret: FAKE_SECRET });

export const fakeJwt = jwtService.sign(
  {
    username: fakeClient.username,
    id: fakeClient.id,
  },
  { expiresIn: FAKE_EXPIRATION },
);
