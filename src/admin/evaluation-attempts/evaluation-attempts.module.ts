import { Module } from '@nestjs/common';
import { EvaluationAttemptsService } from './evaluation-attempts.service';
import { EvaluationAttemptsController } from './evaluation-attempts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationAttempt } from 'ingepro-entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [EvaluationAttemptsController],
  providers: [EvaluationAttemptsService],
  imports: [TypeOrmModule.forFeature([EvaluationAttempt]), AuthModule],
})
export class EvaluationAttemptsModule {}
