import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class FindCourseForCouponDto {
  @IsOptional()
  @Transform(({ value }) => ['true', '1', 1, true].includes(value))
  isForCertificates?: boolean = false;
}
