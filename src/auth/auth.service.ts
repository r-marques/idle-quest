import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRequestDto } from './dto/auth-request.dto';
import * as crypto from 'crypto';
import { ethers } from 'ethers';
import { JwtService } from '@nestjs/jwt';
import { DbService } from '../db/db.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dbService: DbService,
  ) {}
  generateAuthRequest(address: string): AuthRequestDto {
    const nonce = crypto.randomUUID();
    const message = `Welcome to IdleQuest.\n\naddress: ${address}\n\nnonce: ${nonce}`;
    const authRequest = {
      address,
      nonce,
      message,
    };

    this.dbService.store(authRequest);

    return authRequest;
  }

  async validateLogin(
    address: string,
    nonce: string,
    signature: string,
  ): Promise<{ accessToken: string }> {
    const authRequest = this.dbService.retrieve(nonce);

    // verify that this is a valid response to an previous challenge
    if (!authRequest) throw new BadRequestException('Wrong nonce.');

    if (address !== authRequest.address)
      throw new BadRequestException('Wrong address');

    let signerAddress: string;
    try {
      signerAddress = ethers.verifyMessage(authRequest.message, signature);
    } catch {
      throw new BadRequestException('Wrong signature');
    }

    if (signerAddress !== authRequest.address)
      throw new UnauthorizedException();

    // remove used challenge
    this.dbService.delete(nonce);

    const payload = { address: signerAddress };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
