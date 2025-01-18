import { Test, TestingModule } from '@nestjs/testing';
import { PointsController } from './points.controller';
import { Web3Service } from '../web3/web3.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('PointsController', () => {
  let controller: PointsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: '.env.development' })],
      controllers: [PointsController],
      providers: [Web3Service, ConfigService],
    }).compile();

    controller = module.get<PointsController>(PointsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
