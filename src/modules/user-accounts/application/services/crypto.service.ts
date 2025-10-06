import bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {
  async createPasswordHash(password: string): Promise<string> {
    return bcrypt.hash(password, +process.env.COST_FACTOR! as number);
  }

  comparePasswords(args: { password: string; hash: string }): Promise<boolean> {
    return bcrypt.compare(args.password, args.hash);
  }
}
