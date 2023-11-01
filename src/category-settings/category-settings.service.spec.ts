import { Test, TestingModule } from '@nestjs/testing';
import { CategorySettingsService } from './category-settings.service';

describe('CategorySettingsService', () => {
  let service: CategorySettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategorySettingsService],
    }).compile();

    service = module.get<CategorySettingsService>(CategorySettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
