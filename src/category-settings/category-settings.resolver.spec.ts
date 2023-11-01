import { Test, TestingModule } from '@nestjs/testing';
import { CategorySettingsResolver } from './category-settings.resolver';
import { CategorySettingsService } from './category-settings.service';

describe('CategorySettingsResolver', () => {
  let resolver: CategorySettingsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategorySettingsResolver, CategorySettingsService],
    }).compile();

    resolver = module.get<CategorySettingsResolver>(CategorySettingsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
