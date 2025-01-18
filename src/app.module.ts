import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PointsModule } from './points/points.module';
import { Web3Module } from './web3/web3.module';
import { PointsController } from './points/points.controller';
import { Web3Service } from './web3/web3.service';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.development' }),
    PointsModule,
    Web3Module,
    AuthModule,
    DbModule,
  ],
  controllers: [PointsController],
  providers: [Web3Service],
})
export class AppModule {}
