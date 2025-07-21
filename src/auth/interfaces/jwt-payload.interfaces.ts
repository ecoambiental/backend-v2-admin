import { Rol } from 'ingepro-entities/dist/entities/enum/user.enum';

// TODO cambiar
export interface JwtPayload {
  idUsuario: number;
  idRol: number;
  rol_id: Rol;
  companyId: number;
  companyName: string;
  companyPrefix: string;
  userName: string;
  userSurnames: string;
  type: 'Normal' | 'Google';
}

export interface JwtValidate {
  companyId: number;
  companyName: string;
  companyPrefix: string;
  type: 'Normal' | 'Google';
  userId: number;
  userName: string;
  userSurnames: string;
  rolId: Rol;
}

export type GetUserSelection<T extends keyof JwtValidate> = Pick<
  JwtValidate,
  T
>;
