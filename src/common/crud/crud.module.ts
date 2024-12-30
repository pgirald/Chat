import { Module } from '@nestjs/common';
import { CrudService } from './crud.services';
import { PAGE_LIMIT } from './constants';
import { IsUnderPageLimitConstraint } from './isUnderPageLimit';

@Module({
  providers: [
    CrudService,
    IsUnderPageLimitConstraint,
    { provide: PAGE_LIMIT, useValue: 30 },
  ],
  exports: [CrudService, PAGE_LIMIT],
})
export class CrudModule {}
