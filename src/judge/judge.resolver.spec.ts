import { Test, TestingModule } from '@nestjs/testing';
import { JudgeResolver } from './judge.resolver';
import { JudgeService } from './judge.service';

describe('JudgeResolver', () => {
  let resolver: JudgeResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JudgeResolver, JudgeService],
    }).compile();

    resolver = module.get<JudgeResolver>(JudgeResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
