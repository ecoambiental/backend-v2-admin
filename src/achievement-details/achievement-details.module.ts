import { Module } from '@nestjs/common';
import { AchievementDetailsService } from './achievement-details.service';
import { AchievementDetailsController } from './achievement-details.controller';

@Module({
  controllers: [AchievementDetailsController],
  providers: [AchievementDetailsService],
})
export class AchievementDetailsModule {}
