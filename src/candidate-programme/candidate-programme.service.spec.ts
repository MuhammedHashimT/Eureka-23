import { Test, TestingModule } from '@nestjs/testing';
import { CandidateProgrammeService } from './candidate-programme.service';

describe('CandidateProgrammeService', () => {
  let service: CandidateProgrammeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidateProgrammeService],
    }).compile();

    service = module.get<CandidateProgrammeService>(CandidateProgrammeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
