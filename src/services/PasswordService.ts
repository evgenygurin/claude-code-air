import bcrypt from 'bcrypt';
import { IPasswordService } from './IPasswordService';
import { IJwtConfig } from '../config';

export class PasswordService implements IPasswordService {
  constructor(private readonly config: IJwtConfig) {}

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
