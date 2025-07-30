import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginatorDto } from 'src/common/dto';

export class FindCourseReviewDto extends PaginatorDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['1', '2', '3', '4', '5'])
  matricula_valoracion_curso?: string;

  @IsOptional()
  @IsString()
  @IsIn(['1', '2', '3', '4', '5'])
  matricula_valoracion_docente?: string;

  @IsOptional()
  @IsString()
  @IsIn(['1', '2', '3', '4', '5'])
  matricula_valoracion_tutor?: string;
}
