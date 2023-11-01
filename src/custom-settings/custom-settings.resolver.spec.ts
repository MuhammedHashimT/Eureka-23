import { Test, TestingModule } from '@nestjs/testing';
import { CustomSettingsResolver } from './custom-settings.resolver';
import { CustomSettingsService } from './custom-settings.service';

describe('CustomSettingsResolver', () => {
  let resolver: CustomSettingsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomSettingsResolver, CustomSettingsService],
    }).compile();

    resolver = module.get<CustomSettingsResolver>(CustomSettingsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
