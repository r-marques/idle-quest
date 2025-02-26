import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateQuestDto } from './dto/create-quest.dto';
import { Web3Service } from 'src/web3/web3.service';
import { Public } from 'src/auth/auth.decorator';
import { GetQuestDto } from './dto/get-quest.dto';
import { CompleteQuestDto } from './dto/complete-quest.dto';

@Controller('quests')
export class QuestsController {
  constructor(private readonly web3Service: Web3Service) {}

  @Post()
  async createQuest(
    @Body() createQuestDto: CreateQuestDto,
  ): Promise<{ txid: string }> {
    const txid = await this.web3Service.createQuest(
      BigInt(createQuestDto.id),
      createQuestDto.type,
      createQuestDto.tokenAddress,
      BigInt(createQuestDto.amount),
    );

    return { txid };
  }

  @Public()
  @Get('/:id')
  async getQuest(@Param('id') id: string): Promise<GetQuestDto> {
    const quest = await this.web3Service.getQuest(BigInt(id));

    return {
      id: quest.id.toString(),
      type: quest.type,
      tokenAddress: quest.tokenAddress,
      amount: quest.amount.toString(),
    };
  }

  @Post('/complete')
  async completeQuest(
    @Body() completeQuestDto: CompleteQuestDto,
  ): Promise<{ txid: string }> {
    const txid = await this.web3Service.completeQuest(
      BigInt(completeQuestDto.id),
      completeQuestDto.userAddress,
    );

    return { txid };
  }
}
