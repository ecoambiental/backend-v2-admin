import { Module } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluation, EvaluationAttemptDetail } from 'ingepro-entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [EvaluationController],
  providers: [EvaluationService],
  imports: [
    TypeOrmModule.forFeature([Evaluation, EvaluationAttemptDetail]),
    AuthModule,
  ],
})
export class EvaluationModule {}
