import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginatorDto } from 'src/common/dto';

export class FindCoursesForCouponDto extends PaginatorDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => ['true', '1', 1, true].includes(value))
  isForCertificates?: boolean = false;
}
