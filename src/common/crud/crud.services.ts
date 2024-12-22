import { Injectable } from '@nestjs/common';
import { Attributes, FindOptions, Model, ModelStatic } from 'sequelize';
import { PaginationDto } from './paginationDto';
import { Models, TablesNames } from 'src/persistence/constants';

@Injectable()
export class CrudService {
  async findPage<M extends Model>(
    entities: ModelStatic<M>,
    paginationDto: PaginationDto,
    findOps?: FindOptions<Attributes<M>>,
    orderField: string = 'id',
  ): Promise<[M[], boolean]> {
    const pageNumber =
      paginationDto.page < 0 ? paginationDto.page * -1 - 1 : paginationDto.page;
    const page = await entities.findAll({
      offset: pageNumber * paginationDto.count,
      limit: paginationDto.count + 1,
      order:
        paginationDto.page < 0 ? [[orderField, 'DESC']] : [[orderField, 'ASC']],
      ...(findOps || {}),
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
