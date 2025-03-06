import { Injectable } from '@nestjs/common';
import {
  Attributes,
  FindOptions,
  Model,
  ModelStatic,
  Transaction,
} from 'sequelize';
import { PaginationDto } from './paginationDto';

@Injectable()
export class CrudService {
  async findPage<M extends Model>(
    entities: ModelStatic<M>,
    paginationDto: PaginationDto,
    findOps?: FindOptions<Attributes<M>>,
    orderField: string = 'id',
  ): Promise<[M[], boolean]> {
    const pagQuery = this.getPaginationQuery(
      { page: paginationDto.page, count: paginationDto.count },
      orderField,
    );

    if (findOps.order) {
      pagQuery.order.push(...(findOps.order as string[][]));
    }

    const page = await entities.findAll({
      ...(findOps || {}),
      ...{
        ...(pagQuery as FindOptions),
        limit: paginationDto.count + 1,
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

  getPaginationQuery(paginationDto: PaginationDto, orderField: string) {
    const pageNumber =
      paginationDto.page < 0 ? paginationDto.page * -1 - 1 : paginationDto.page;
    return {
      offset: pageNumber * paginationDto.count,
      limit: paginationDto.count,
      order:
        paginationDto.page < 0 ? [[orderField, 'DESC']] : [[orderField, 'ASC']],
    };
  }
}
