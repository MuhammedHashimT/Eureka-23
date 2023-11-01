import { Test, TestingModule } from '@nestjs/testing';
import { SubstituteResolver } from './substitute.resolver';
import { SubstituteService } from './substitute.service';

describe('SubstituteResolver', () => {
  let resolver: SubstituteResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubstituteResolver, SubstituteService],
    }).compile();

    resolver = module.get<SubstituteResolver>(SubstituteResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
