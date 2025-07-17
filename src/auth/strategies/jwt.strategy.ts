import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'ingepro-entities';
import { FindOptionsSelect, Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, JwtValidate } from '../interfaces/jwt-payload.interfaces';
import { Rol } from 'ingepro-entities/dist/entities/enum/user.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate({ idUsuario, idRol }: JwtPayload): Promise<JwtValidate> {
    const relations = {
      1: 'administrador',
      2: 'tutor',
      3: 'teacher',
      5: 'administrador',
      // 6: 'Contador',
    };
    const relation = relations[idRol];
    if (!relation) {
      throw new UnauthorizedException('Rol no permitido');
    }

    const select: FindOptionsSelect<User> = {
      usuario_id: true,
      usuario_nombres: true,
      usuario_apellidos: true,
      usuario_clave: true,
      usuario_estado: true,
      usuario_tipo: true,
      rol_id: true,
    };

    select[relation] = {
      ...(idRol === Rol.Administrador || idRol === Rol.SubAdministrador
        ? { admin_id: true }
        : idRol === Rol.Tutor
          ? { tutor_id: true }
          : idRol === Rol.Docente
            ? { docente_id: true }
            : {}),
      company: {
        institucion_id: true,
        institucion_nombre: true,
        institucion_prefijo: true,
      },
    };
    const user = await this.userRepository.findOne({
      select,
      relations: [`${relation}`, `${relation}.company`],
      where: { usuario_id: idUsuario, rol_id: idRol },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    const company = user[relation]?.company;
    if (!company) throw new UnauthorizedException('Institución no encontrada');
    return {
      companyId: company.institucion_id,
      companyName: company.institucion_nombre,
      companyPrefix: company.institucion_prefijo,
      password: user.usuario_clave,
      state: user.usuario_estado,
      type: user.usuario_tipo,
      userId: idUsuario,
      userName: user.usuario_nombres,
      userSurnames: user.usuario_apellidos,
      rolId: user.rol_id,
    };
  }
}
