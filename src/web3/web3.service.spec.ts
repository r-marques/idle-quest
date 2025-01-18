import { Test, TestingModule } from '@nestjs/testing';
import { Web3Service } from './web3.service';

describe('Web3Service', () => {
  let service: Web3Service;
  let address: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Web3Service],
    }).compile();

    service = module.get<Web3Service>(Web3Service);
    address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
    expect(await service.getPoints(address)).toBe(0n);

    await service.setPoints(address, 10n);
    expect(await service.getPoints(address)).toBe(10n);
  });
});
