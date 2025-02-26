import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { CreateQuestDto } from './dto/create-quest.dto';
import { Web3Service } from 'src/web3/web3.service';
import { Public } from 'src/auth/auth.decorator';
import { GetQuestDto } from './dto/get-quest.dto';
import { CompleteQuestDto } from './dto/complete-quest.dto';

@Controller('quests')
export class QuestsController {
  constructor(private readonly web3Service: Web3Service) {}

  @Public()
  @Post()
  async createQuest(
    @Body() createQuestDto: CreateQuestDto,
  ): Promise<{ txid: string }> {
    console.log(createQuestDto);
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
    console.log(quest);

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
    @Request() req,
  ): Promise<{ txid: string }> {
    const txid = await this.web3Service.completeQuest(
      BigInt(completeQuestDto.id),
      req.user.address,
    );

    return { txid };
  }

  @Get('/complete/:id')
  async isQuestCompleted(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ completed: boolean }> {
    const completed = await this.web3Service.isQuestCompleted(
      BigInt(id),
      req.user.address,
    );

    return { completed };
  }
}
