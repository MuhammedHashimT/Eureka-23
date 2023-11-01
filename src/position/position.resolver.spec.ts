import { Test, TestingModule } from '@nestjs/testing';
import { PositionResolver } from './position.resolver';
import { PositionService } from './position.service';

describe('PositionResolver', () => {
  let resolver: PositionResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PositionResolver, PositionService],
    }).compile();

    resolver = module.get<PositionResolver>(PositionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
