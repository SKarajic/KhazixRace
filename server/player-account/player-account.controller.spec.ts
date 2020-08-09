import { Test, TestingModule } from '@nestjs/testing';
import { PlayerAccountController } from './player-account.controller';

describe('PlayerAccount Controller', () => {
  let controller: PlayerAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerAccountController],
    }).compile();

    controller = module.get<PlayerAccountController>(PlayerAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
