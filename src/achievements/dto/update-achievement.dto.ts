import { IsString } from 'class-validator';

export class UpdateAchievementDto {
  @IsString()
  logro_descripcion: string;
}
