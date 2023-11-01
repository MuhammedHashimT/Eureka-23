import { Test, TestingModule } from '@nestjs/testing';
import { DetailsResolver } from './details.resolver';
import { DetailsService } from './details.service';

describe('DetailsResolver', () => {
  let resolver: DetailsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetailsResolver, DetailsService],
    }).compile();

    resolver = module.get<DetailsResolver>(DetailsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
