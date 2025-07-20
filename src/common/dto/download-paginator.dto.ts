import { DownloadDto } from './download.dto';
import { IntersectionType } from '@nestjs/swagger';
import { PaginatorDto } from './paginator.dto';

export class DownloadPaginatorDto extends IntersectionType(
  DownloadDto,
  PaginatorDto,
) {}
