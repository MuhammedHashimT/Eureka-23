import { Test, TestingModule } from '@nestjs/testing';
import { ProgrammesResolver } from './programmes.resolver';
import { ProgrammesService } from './programmes.service';

describe('ProgrammesResolver', () => {
  let resolver: ProgrammesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgrammesResolver, ProgrammesService],
    }).compile();

    resolver = module.get<ProgrammesResolver>(ProgrammesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
