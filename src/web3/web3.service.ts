import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as fs from 'fs';
import { Quest } from './web3.interface';

@Injectable()
export class Web3Service {
  readonly account: ethers.Wallet;
  readonly idleQuestContract: ethers.Contract;

  constructor(private configService: ConfigService) {
    const artifact = JSON.parse(
      fs.readFileSync('./artifacts/IdleQuest.json', 'utf-8'),
    );

    const rpcUrl = this.configService.get<string>('RPC_URL');
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    this.account = new ethers.Wallet(privateKey, provider);
    this.idleQuestContract = new ethers.Contract(
      contractAddress,
      artifact.abi,
      this.account,
    );
  }

  async getPoints(address: string): Promise<bigint> {
    return this.idleQuestContract.get(address);
  }

  async setPoints(address: string, points: bigint) {
    const tx = await this.idleQuestContract.set(address, points);
    await tx.wait();
  }

  async createQuest(
    id: bigint,
    type: number,
    tokenAddress: string,
    amount: bigint,
  ): Promise<string> {
    const tx = await this.idleQuestContract.createQuest(
      id,
      type,
      tokenAddress,
      amount,
    );
    const txReceipt = tx.wait();

    return txReceipt.hash;
  }

  async getQuest(id: bigint): Promise<Quest> {
    return this.idleQuestContract.getQuest(id);
  }

  async completeQuest(id: bigint, userAddress: string): Promise<string> {
    const tx = await this.idleQuestContract.completeQuest(id, userAddress);
    const txReceipt = tx.wait();

    return txReceipt.hash;
  }

  validateAddress(address: string): boolean {
    try {
      ethers.getAddress(address);
    } catch {
      return false;
    }
    return true;
  }
}
