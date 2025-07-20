import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { COURSE_RELATIONS, CourseRelation } from '../constants';
import { PaginatorDto } from 'src/common/dto';

export class FindCoursesForCouponDto extends PaginatorDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => ['true', '1', 1, true].includes(value))
  isForCertificates: boolean = false;
}
