import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { Op, Sequelize } from 'sequelize';
import { Models, MODELS } from '../persistence/constants';
import { PaginationDto } from './contacts.dto';

@Controller('contacts')
export class ContactsController {
  constructor(@Inject(MODELS) private models: Models) {}

  @Post('find')
  async findPage(@Body(ValidationPipe) paginationDto: PaginationDto) {
    const pageNumber =
      paginationDto.page < 0 ? paginationDto.page * -1 - 1 : paginationDto.page;
    const page = await this.models.Clients.findAll({
      offset: pageNumber * paginationDto.count,
      limit: paginationDto.count + 1,
      order: paginationDto.page < 0 ? [['id', 'DESC']] : [['id', 'ASC']],
      where: paginationDto.filter && {
        username: { [Op.like]: `%${paginationDto.filter}%` },
      },
    });
    let hasMore = false;
    if (page.length === paginationDto.count + 1) {
      hasMore = true;
      page.pop();
    }
    if (paginationDto.page < 0) {
      page.reverse();
    }
    return [page, hasMore];
  }
}
