import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getTestingApp } from '../../test/src/common/mockApp/testingApp';
import { PAGE_LIMIT } from '../common/crud/constants';
import { useContainer } from 'class-validator';
import { AUTHORIZATION, BEARER } from '../auth/constants';
import { getFakeJwt } from '../../test/src/common/mockApp/fakeJwt';
import {
  fakeClient,
  fakeData,
} from '../../test/src/persistence/fakeData/fakeData';
import { ChatsPaginationDto } from './dto/chatsPagination.dto';
import { admon } from '../../test/src/persistence/fakeData/specimens';

describe('ChatsController', () => {
  beforeAll(async () => {});

  test('nothing', () => {});
});
