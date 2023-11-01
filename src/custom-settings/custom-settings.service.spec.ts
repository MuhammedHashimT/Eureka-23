import { Test, TestingModule } from '@nestjs/testing';
import { CustomSettingsService } from './custom-settings.service';

describe('CustomSettingsService', () => {
  let service: CustomSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomSettingsService],
    }).compile();

    service = module.get<CustomSettingsService>(CustomSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
