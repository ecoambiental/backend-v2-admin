import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement, Teacher, Tutor } from 'ingepro-entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AchievementsController],
  providers: [AchievementsService],
  imports: [
    TypeOrmModule.forFeature([Achievement, Teacher, Tutor]),
    AuthModule,
  ],
})
export class AchievementsModule {}
