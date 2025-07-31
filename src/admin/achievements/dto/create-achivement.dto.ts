import { IsString, IsInt, IsIn } from 'class-validator';

export class CreateAchievementDto {
  @IsString()
  logro_descripcion: string;

  @IsIn(['Docente', 'Tutor'])
  tipo_logro: string;

  @IsInt()
  tipo_usuario_id: number;
}
