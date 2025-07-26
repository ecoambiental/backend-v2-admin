import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Evaluation } from 'ingepro-entities';
import { Repository } from 'typeorm';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private evaluationRepository: Repository<Evaluation>,
  ) {}

  async findEvaluationAttemptsByStudent(
    companyId: number,
    evaluationId: number,
    studentId: number,
  ) {
    const evaluation = await this.evaluationRepository
      .createQueryBuilder('evaluation')
      .leftJoinAndSelect('evaluation.evaluationAttempt', 'attempt')
      .leftJoinAndSelect('attempt.student', 'student')
      .leftJoin('student.company', 'company')
      .loadRelationCountAndMap(
        'attempt.evaluationAttemptDetailCount',
        'attempt.evaluationAttemptDetail',
      )
      .where('evaluation.evaluacion_id = :evaluationId', { evaluationId })
      .andWhere('student.estudiante_id = :studentId', { studentId })
      .andWhere('company.institucion_id = :companyId', { companyId })
      .getOne();
    if (!evaluation)
      throw new NotFoundException(
        `No se encontraron intentos de evaluación para el estudiante con ID ${studentId} en la evaluación ${evaluationId} dentro de la institución ${companyId}.`,
      );
    return evaluation;
  }
}
