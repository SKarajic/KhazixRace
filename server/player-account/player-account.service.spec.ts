import { Test, TestingModule } from '@nestjs/testing';
import { PlayerAccountService } from './player-account.service';

describe('PlayerAccountService', () => {
  let service: PlayerAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerAccountService],
    }).compile();

    service = module.get<PlayerAccountService>(PlayerAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
