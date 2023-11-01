import { Test, TestingModule } from '@nestjs/testing';
import { GradesResolver } from './grades.resolver';
import { GradesService } from './grades.service';

describe('GradesResolver', () => {
  let resolver: GradesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GradesResolver, GradesService],
    }).compile();

    resolver = module.get<GradesResolver>(GradesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
