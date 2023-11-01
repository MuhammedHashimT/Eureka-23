import { Test, TestingModule } from '@nestjs/testing';
import { CandidateProgrammeResolver } from './candidate-programme.resolver';
import { CandidateProgrammeService } from './candidate-programme.service';

describe('CandidateProgrammeResolver', () => {
  let resolver: CandidateProgrammeResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidateProgrammeResolver, CandidateProgrammeService],
    }).compile();

    resolver = module.get<CandidateProgrammeResolver>(CandidateProgrammeResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
