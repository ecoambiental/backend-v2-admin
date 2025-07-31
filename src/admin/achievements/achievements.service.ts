import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Achievement,
  AchievementDetail,
  Teacher,
  Tutor,
} from 'ingepro-entities';
import { Repository } from 'typeorm';
import {
  CreateAchievementDto,
  CreateDetailDto,
  FindAchievementsDto,
  UpdateDetailDto,
} from './dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(AchievementDetail)
    private detailRepository: Repository<AchievementDetail>,
    @InjectRepository(Teacher) private teacherRepository: Repository<Teacher>,
    @InjectRepository(Tutor) private tutorRepository: Repository<Tutor>,
  ) {}

  async createAchievement(companyId: number, dto: CreateAchievementDto) {
    const { tipo_logro, tipo_usuario_id, logro_descripcion } = dto;
    let belongsToCompany = false;
    if (tipo_logro === 'Docente') {
      const teacher = await this.teacherRepository.findOne({
        where: {
          docente_id: tipo_usuario_id,
          company: { institucion_id: companyId },
        },
      });
      belongsToCompany = !!teacher;
    } else if (tipo_logro === 'Tutor') {
      const tutor = await this.tutorRepository.findOne({
        where: {
          tutor_id: tipo_usuario_id,
          company: { institucion_id: companyId },
        },
      });
      belongsToCompany = !!tutor;
    }
    if (!belongsToCompany) {
      throw new NotFoundException(
        `${tipo_logro} con ID ${tipo_usuario_id} no pertenece a la institución ${companyId}`,
      );
    }
    const newAchievement = this.achievementRepository.create({
      logro_descripcion,
      tipo_logro,
      tipo_usuario_id,
    });
    return await this.achievementRepository.save(newAchievement);
  }

  async findAchievements(
    companyId: number,
    { entityId, userType }: FindAchievementsDto,
  ) {
    const query = this.achievementRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.details', 'd')
      .leftJoin(
        'a.teacher',
        'te',
        'te.docente_id = a.tipo_usuario_id AND a.tipo_logro = :docente',
        {
          docente: 'Docente',
        },
      )
      .leftJoin('te.company', 'tc')
      .leftJoin(
        'a.tutor',
        'tu',
        'tu.tutor_id = a.tipo_usuario_id AND a.tipo_logro = :tutor',
        {
          tutor: 'Tutor',
        },
      )
      .leftJoin('tu.company', 'tuc')
      .where(
        `(tc.institucion_id = :companyId OR tuc.institucion_id = :companyId)`,
        { companyId },
      );
    if (userType) query.andWhere(`a.tipo_logro = :userType`, { userType });
    if (entityId) query.andWhere(`a.tipo_usuario_id = :entityId`, { entityId });
    const achievements = await query.getMany();
    return achievements;
  }

  async findAchievement(companyId: number, achievementId: number) {
    const achievement = await this.achievementRepository
      .createQueryBuilder('a')
      .leftJoin(
        'a.teacher',
        'te',
        'te.docente_id = a.tipo_usuario_id AND a.tipo_logro = :docente',
        {
          docente: 'Docente',
        },
      )
      .leftJoin('te.company', 'tc')
      .leftJoin(
        'a.tutor',
        'tu',
        'tu.tutor_id = a.tipo_usuario_id AND a.tipo_logro = :tutor',
        {
          tutor: 'Tutor',
        },
      )
      .leftJoin('tu.company', 'tuc')
      .where(
        `a.logro_id = :achievementId AND (tc.institucion_id = :companyId OR tuc.institucion_id = :companyId)`,
        { achievementId, companyId },
      )
      .getOne();

    if (!achievement) {
      throw new NotFoundException(
        `Logro con ID ${achievementId} no encontrado para la institución ${companyId}`,
      );
    }

    return achievement;
  }

  async updateAchievement(
    companyId: number,
    achievementId: number,
    dto: UpdateAchievementDto,
  ) {
    const achievement = await this.findAchievement(companyId, achievementId);
    achievement.logro_descripcion = dto.logro_descripcion;
    await this.achievementRepository.save(achievement);
    return achievement;
  }

  async createDetail(
    companyId: number,
    achievementId: number,
    dto: CreateDetailDto,
  ) {
    const { logro_detalle_descripcion } = dto;
    const achievement = await this.findAchievement(companyId, achievementId);
    const newDetail = this.detailRepository.create({
      logro_detalle_descripcion,
      achievement,
    });
    return await this.detailRepository.save(newDetail);
  }

  async updateDetail(
    companyId: number,
    achievementId: number,
    detailId: number,
    dto: UpdateDetailDto,
  ) {
    const { logro_detalle_descripcion } = dto;
    await this.findAchievement(companyId, achievementId);
    const detail = await this.detailRepository.findOne({
      where: {
        logro_detalle_id: detailId,
        achievement: {
          logro_id: achievementId,
        },
      },
    });
    if (!detail) {
      throw new NotFoundException(
        `Detalle con ID ${detailId} no encontrado para el logro ${achievementId}`,
      );
    }
    detail.logro_detalle_descripcion = logro_detalle_descripcion;
    return await this.detailRepository.save(detail);
  }
}
