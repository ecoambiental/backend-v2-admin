import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginatorDto } from 'src/common/dto';

export class FindCourseReviewDto extends PaginatorDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['1', '2', '3', '4', '5'])
  courseRating?: string;

  @IsOptional()
  @IsString()
  @IsIn(['1', '2', '3', '4', '5'])
  teacherRating?: string;

  @IsOptional()
  @IsString()
  @IsIn(['1', '2', '3', '4', '5'])
  tutorRating?: string;
}
