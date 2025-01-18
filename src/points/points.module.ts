import { Module } from '@nestjs/common';
import { PointsController } from './points.controller';
import { Web3Service } from '../web3/web3.service';

@Module({
  controllers: [PointsController],
  providers: [Web3Service],
})
export class PointsModule {}
