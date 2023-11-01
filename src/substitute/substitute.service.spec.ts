import { Test, TestingModule } from '@nestjs/testing';
import { SubstituteService } from './substitute.service';

describe('SubstituteService', () => {
  let service: SubstituteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubstituteService],
    }).compile();

    service = module.get<SubstituteService>(SubstituteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
