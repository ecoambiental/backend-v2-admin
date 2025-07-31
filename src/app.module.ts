import { Module } from '@nestjs/common';
import { databaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CouponsModule } from './admin/coupons/coupons.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './admin/courses/courses.module';
import { EvaluationAttemptsModule } from './admin/evaluation-attempts/evaluation-attempts.module';
import { EvaluationModule } from './admin/evaluation/evaluation.module';
import { ReviewsModule } from './admin/reviews/reviews.module';
import { AchievementsModule } from './achievements/achievements.module';
import { AchievementDetailsModule } from './achievement-details/achievement-details.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(databaseConfig),
    AchievementDetailsModule,
    AchievementsModule,
    AuthModule,
    CouponsModule,
    CoursesModule,
    EvaluationAttemptsModule,
    EvaluationModule,
    ReviewsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {}
}
