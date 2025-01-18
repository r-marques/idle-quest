import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ethers } from 'ethers';
import { AuthRequestDto } from './dto/auth-request.dto';
import { JwtModule } from '@nestjs/jwt';
import { DbService } from '../db/db.service';

describe('AuthService', () => {
  let service: AuthService;
  let signer: ethers.HDNodeWallet;
  let authRequest: AuthRequestDto;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secret',
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [AuthService, DbService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    signer = ethers.Wallet.createRandom();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate an auth request', () => {
    authRequest = service.generateAuthRequest(signer.address);
    expect(authRequest.address).toBe(signer.address);
  });

  it('should correctly validate a correct signature', async () => {
    const signature = await signer.signMessage(authRequest.message);
    const response = await service.validateLogin(
      signer.address,
      authRequest.nonce,
      signature,
    );

    expect(response.accessToken).toBeDefined();
  });
});
