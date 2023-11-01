import { Test, TestingModule } from '@nestjs/testing';
import { ProgrammesService } from './programmes.service';

describe('ProgrammesService', () => {
  let service: ProgrammesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgrammesService],
    }).compile();

    service = module.get<ProgrammesService>(ProgrammesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
