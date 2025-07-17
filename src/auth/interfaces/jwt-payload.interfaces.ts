import { Rol } from 'ingepro-entities/dist/entities/enum/user.enum';

// TODO cambiar
export interface JwtPayload {
  idUsuario: number;
  idRol: number;
}

export interface JwtValidate {
  companyId: number;
  companyName: string;
  companyPrefix: string;
  password: string;
  state: number;
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
