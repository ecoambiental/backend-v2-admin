import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'ingepro-entities';
import { Repository } from 'typeorm';
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

  // TODO HACER USUARIO ESTADO UN ENUM
  async validate({
    companyId,
    companyName,
    companyPrefix,
    rol_id,
    idUsuario,
    userName,
    userSurnames,
    type,
  }: JwtPayload): Promise<JwtValidate> {
    if (rol_id === Rol.Estudiante)
      throw new ForbiddenException(
        'Acceso denegado para usuarios con rol Estudiante',
      );
    const user = await this.userRepository.findOne({
      select: {
        usuario_id: true,
      },
      where: { usuario_id: idUsuario, rol_id, usuario_estado: 1 },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return {
      companyId,
      companyName,
      companyPrefix,
      type,
      userId: idUsuario,
      userName,
      userSurnames,
      rolId: rol_id,
    };
  }
}
