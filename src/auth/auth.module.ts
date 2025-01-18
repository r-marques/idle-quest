import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Web3Service } from '../web3/web3.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { DbService } from '../db/db.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '7d' },
          global: true,
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    Web3Service,
    DbService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AuthModule {}
