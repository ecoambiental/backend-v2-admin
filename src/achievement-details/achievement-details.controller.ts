import { Controller } from '@nestjs/common';
import { AchievementDetailsService } from './achievement-details.service';

@Controller('achievement-details')
export class AchievementDetailsController {
  constructor(private readonly achievementDetailsService: AchievementDetailsService) {}
}
