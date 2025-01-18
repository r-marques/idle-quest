import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ethers } from 'ethers';
import { AuthRequestDto } from 'src/auth/dto/auth-request.dto';
import { LoginDto } from 'src/auth/dto/login.dto';
import { SetPointsDto } from 'src/points/dto/set-points.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let signer: ethers.HDNodeWallet;
  let authRequest: AuthRequestDto;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    signer = ethers.Wallet.createRandom();
  });

  it('/auth (GET) should get a authentication challenge', async () => {
    const response = await request(app.getHttpServer())
      .get(`/auth/${signer.address}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.nonce).toBeDefined();
        expect(body.message).toBeDefined();
        expect(body.address).toBe(signer.address);
      });

    authRequest = response.body;
  });

  it('/auth (POST) should get access token for valid signature', async () => {
    // generate valid signature
    const signature = await signer.signMessage(authRequest.message);
    const requestBody: LoginDto = {
      address: signer.address,
      nonce: authRequest.nonce,
      signature,
    };
    const response = await request(app.getHttpServer())
      .post('/auth')
      .send(requestBody)
      .expect(201)
      .expect(({ body }) => expect(body.accessToken).toBeDefined());

    accessToken = response.body.accessToken;
  });

  it('/points (POST) should get unauthorized if Bearer token is not set', () => {
    const requestBody: SetPointsDto = {
      points: 10n.toString(),
    };

    request(app.getHttpServer()).post('/points').send(requestBody).expect(401);
  });

  it('/points (POST) should set points for authenticated user', () => {
    const requestBody: SetPointsDto = {
      points: 10n.toString(),
    };

    request(app.getHttpServer())
      .post('/points')
      .set({ Authentication: `Bearer ${accessToken}` })
      .send(requestBody)
      .expect(201)
      .expect(({ body }) => {
        expect(body.address).toBe(signer.address);
        expect(BigInt(body.points)).toBe(10n);
      });
  });

  it('/points (GET) shoulg get the points for address', () => {
    request(app.getHttpServer())
      .get(`/points/${signer.address}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.address).toBe(signer.address);
        expect(BigInt(body.points)).toBe(10n);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
