import { Module } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Evaluation,
  EvaluationAttempt,
  EvaluationAttemptDetail,
  Question,
} from 'ingepro-entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  imports: [TypeOrmModule.forFeature([EvaluationAttempt]), AuthModule],
})
export class EvaluationsModule {}
