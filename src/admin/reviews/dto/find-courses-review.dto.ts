import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  CourseModality,
  CourseState,
  CourseType,
} from 'ingepro-entities/dist/entities/enum/course.enum';
import { PaginatorDto } from 'src/common/dto';

export class FindCoursesReviewDto extends PaginatorDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CourseState)
  state?: CourseState;

  @IsOptional()
  @IsEnum(CourseType)
  type?: CourseType;

  @IsOptional()
  @IsEnum(CourseModality)
  modality?: CourseModality;
}
