import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesResolver } from './candidates.resolver';
import { CandidatesService } from './candidates.service';

describe('CandidatesResolver', () => {
  let resolver: CandidatesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidatesResolver, CandidatesService],
    }).compile();

    resolver = module.get<CandidatesResolver>(CandidatesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
