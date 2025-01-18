import { Injectable } from '@nestjs/common';
import { AuthRequest } from './db.interface';

@Injectable()
export class DbService {
  private db: Map<string, AuthRequest>;

  constructor() {
    this.db = new Map<string, AuthRequest>();
  }

  store(authRequest: AuthRequest) {
    this.db.set(authRequest.nonce, authRequest);
  }

  retrieve(nonce: string): AuthRequest {
    return this.db.get(nonce);
  }

  delete(nonce: string) {
    this.db.delete(nonce);
  }
}
