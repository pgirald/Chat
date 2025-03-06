import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChatsPaginationDto } from './dto/chatsPagination.dto';
import { CrudService } from '../common/crud/crud.services';
import {
  CHAT_CONTACTS,
  CHAT_MESSAGES,
  CHAT_OWNER,
  CHAT_RINGTONE,
  CHAT_SUBSCRIPTIONS,
  MESSAGE_ATTACHMENTS,
  MESSAGE_SENDER,
  MESSAGES_IDXS,
  MESSAGES_MESSAGES,
  Models,
  RESTRICTED_CONTACTS,
  SEQUELIZE,
  TablesNames,
} from '../persistence/constants';
import { Profile, PROFILE } from '../auth/token_extractors/JwtExtractor';
import { col, FindOptions, fn, literal, Op, Sequelize } from 'sequelize';
import { CONTACTS_SERVICE, RINGTONES_SERVICE } from './constants';
import { ContactsServiceI } from './interfaces/contactsServiceI';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { ChatsService } from './chats.service';
import { Chat } from 'chat-api';
import { AppValidationPipe } from '../common/AppValidation.pipe';

@Controller('chats')
export class ChatsController {
  constructor(
    @Inject(SEQUELIZE)
    private readonly sequelize: Models['sequelize'],
    private readonly chatsService: ChatsService,
  ) {}

  @UseGuards(PermissionsGuard)
  @Post('find')
  findPage(
    @Body(AppValidationPipe) chatsPaginationDto: ChatsPaginationDto,
    @Request() req,
  ) {
    return this.sequelize.transaction((transaction) =>
      this.chatsService.
    getChatViews(req, chatsPaginationDto, transaction),
    );
  }
}
