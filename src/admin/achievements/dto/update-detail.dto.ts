import { IsString } from 'class-validator';

export class UpdateDetailDto {
  @IsString()
  logro_detalle_descripcion: string;
}
