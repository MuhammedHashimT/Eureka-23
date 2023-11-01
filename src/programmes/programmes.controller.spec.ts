import { Test, TestingModule } from '@nestjs/testing';
import { ProgrammesController } from './programmes.controller';

describe('ProgrammesController', () => {
  let controller: ProgrammesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgrammesController],
    }).compile();

    controller = module.get<ProgrammesController>(ProgrammesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
