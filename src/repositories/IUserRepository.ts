import { User } from '../types';

export interface IUserRepository {
  findAll(): User[];
  findById(id: string): User | undefined;
  findByEmail(email: string): User | undefined;
  create(user: User): User;
  update(id: string, user: Partial<User>): User | undefined;
  delete(id: string): boolean;
  exists(id: string): boolean;
}
