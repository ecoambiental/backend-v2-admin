import { Module } from '@nestjs/common';
import { databaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CouponsModule } from './admin/coupons/coupons.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './admin/courses/courses.module';
import { EvaluationAttemptsModule } from './admin/evaluation-attempts/evaluation-attempts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(databaseConfig),
    AuthModule,
    CouponsModule,
    CoursesModule,
    EvaluationAttemptsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {}
}
