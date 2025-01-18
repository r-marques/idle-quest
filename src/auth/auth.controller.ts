import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/auth-request.dto';
import { Web3Service } from '../web3/web3.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly web3Service: Web3Service,
  ) {}

  @Public()
  @Get('/:address')
  authRequest(@Param('address') address: string): AuthRequestDto {
    // Validate address
    if (!this.web3Service.validateAddress(address))
      throw new BadRequestException('Invalid address');

    return this.authService.generateAuthRequest(address);
  }

  @Public()
  @Post()
  login(@Body() login: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.validateLogin(
      login.address,
      login.nonce,
      login.signature,
    );
  }
}
