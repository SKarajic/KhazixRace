import { Test, TestingModule } from '@nestjs/testing';
import { PlayerStreamController } from './player-stream.controller';

describe('PlayerStream Controller', () => {
  let controller: PlayerStreamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerStreamController],
    }).compile();

    controller = module.get<PlayerStreamController>(PlayerStreamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
