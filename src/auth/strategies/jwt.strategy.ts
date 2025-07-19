import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator, Teacher, Tutor, User } from 'ingepro-entities';
import { FindOptionsSelect, Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, JwtValidate } from '../interfaces/jwt-payload.interfaces';
import { Rol } from 'ingepro-entities/dist/entities/enum/user.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Administrator)
    private administratorRepository: Repository<Administrator>,
    @InjectRepository(Tutor) private tutorRepository: Repository<Tutor>,
    @InjectRepository(Teacher) private teacherRepository: Repository<Teacher>,
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate({ idUsuario }: JwtPayload): Promise<JwtValidate> {
    const select: FindOptionsSelect<User> = {
      usuario_id: true,
      usuario_nombres: true,
      usuario_apellidos: true,
      usuario_clave: true,
      usuario_estado: true,
      usuario_tipo: true,
      rol_id: true,
    };
    const user = await this.userRepository.findOne({
      select,
      where: { usuario_id: idUsuario },
      relations: ['administrador.company', 'teacher.company', 'tutor.company'],
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    let company: {
      institucion_id: number;
      institucion_nombre: string;
      institucion_prefijo: string;
    } | null = null;

    if (
      user.rol_id === Rol.Administrador ||
      user.rol_id === Rol.SubAdministrador
    ) {
      company = user.administrador?.company || null;
    } else if (user.rol_id === Rol.Docente) {
      company = user.teacher?.company || null;
    } else if (user.rol_id === Rol.Tutor) {
      company = user.tutor?.company || null;
    }

    if (!company) {
      throw new UnauthorizedException('Institución no encontrada');
    }
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

  async getCompanyByRole(
    role: Rol,
    userId: number,
  ): Promise<{
    institucion_id: number;
    institucion_nombre: string;
    institucion_prefijo: string;
  }> {
    const commonSelect = {
      institucion_id: true,
      institucion_nombre: true,
      institucion_prefijo: true,
    };

    const where = { user: { usuario_id: userId } };

    if (role === Rol.Administrador || role === Rol.SubAdministrador) {
      const admin = await this.administratorRepository.findOne({
        select: { admin_id: true, company: commonSelect },
        relations: ['company'],
        where,
      });
      if (!admin?.company)
        throw new UnauthorizedException('Institución no encontrada');
      return admin.company;
    }

    if (role === Rol.Docente) {
      const teacher = await this.teacherRepository.findOne({
        select: { docente_id: true, company: commonSelect },
        relations: ['company'],
        where,
      });
      if (!teacher?.company)
        throw new UnauthorizedException('Institución no encontrada');
      return teacher.company;
    }

    if (role === Rol.Tutor) {
      const tutor = await this.tutorRepository.findOne({
        select: { tutor_id: true, company: commonSelect },
        relations: ['company'],
        where,
      });
      if (!tutor?.company)
        throw new UnauthorizedException('Institución no encontrada');
      return tutor.company;
    }

    // Rol no permitido
    throw new UnauthorizedException('Rol de usuario no permitido');
  }
}
