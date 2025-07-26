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
    const evaluation = await this.evaluationRepository.findOne({
      relations: {
        evaluationAttempt: true,
      },
      where: {
        evaluacion_id: evaluationId,
        evaluationAttempt: {
          student: {
            estudiante_id: studentId,
            company: { institucion_id: companyId },
          },
        },
      },
    });
    if (!evaluation)
      throw new NotFoundException(
        `No se encontraron intentos de evaluación para el estudiante con ID ${studentId} en la evaluación ${evaluationId} dentro de la institución ${companyId}.`,
      );
    return evaluation;
  }
}
