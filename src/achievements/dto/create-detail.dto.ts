import { IsString } from 'class-validator';
export class CreateDetailDto {
  @IsString()
  logro_detalle_descripcion: string;
}
