import { Module } from '@nestjs/common';
import { QuestsController } from './quests.controller';
import { Web3Service } from 'src/web3/web3.service';

@Module({
  controllers: [QuestsController],
  providers: [Web3Service],
})
export class QuestsModule {}
