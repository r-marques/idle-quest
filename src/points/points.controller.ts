import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { Web3Service } from '../web3/web3.service';
import { SetPointsDto } from './dto/set-points.dto';
import { GetPointsDto } from './dto/get-points.dto';
import { Public } from '../auth/auth.decorator';

@Controller('points')
export class PointsController {
  constructor(private readonly web3Service: Web3Service) {}

  @Public()
  @Get('/:address')
  async getPoints(@Param('address') address: string): Promise<GetPointsDto> {
    // Validate address
    if (!this.web3Service.validateAddress(address))
      throw new BadRequestException('Invalid address');

    const points = await this.web3Service.getPoints(address);
    return { address, points: points.toString() };
  }

  @Post()
  async setPoints(
    @Body() setPointsDto: SetPointsDto,
    @Request() req,
  ): Promise<GetPointsDto> {
    await this.web3Service.setPoints(
      req.user.address,
      BigInt(setPointsDto.points),
    );
    const points = await this.web3Service.getPoints(req.user.address);

    return { address: req.user.address, points: points.toString() };
  }
}
