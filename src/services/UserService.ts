import {
  User,
  UserPublic,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types';
import { IUserService } from './IUserService';
import { IUserRepository } from '../repositories/IUserRepository';
import { IdGenerator } from '../utils/IdGenerator';
import { NotFoundError, ValidationError } from '../errors';

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  getAllUsers(): UserPublic[] {
    return this.userRepository.findAll().map((user) => this.toPublic(user));
  }

  getUserById(id: string): UserPublic {
    const user = this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return this.toPublic(user);
  }

  createUser(request: CreateUserRequest): UserPublic {
    this.validateCreateUserRequest(request);

    const user: User = {
      id: IdGenerator.generate('user'),
      name: request.name,
      email: request.email,
      password: '',
      createdAt: new Date(),
    };

    this.userRepository.create(user);
    return this.toPublic(user);
  }

  updateUser(id: string, request: UpdateUserRequest): UserPublic {
    if (!this.userRepository.exists(id)) {
      throw new NotFoundError('User');
    }

    const updated = this.userRepository.update(id, request);
    if (!updated) {
      throw new NotFoundError('User');
    }

    return this.toPublic(updated);
  }

  deleteUser(id: string): void {
    if (!this.userRepository.delete(id)) {
      throw new NotFoundError('User');
    }
  }

  private validateCreateUserRequest(request: CreateUserRequest): void {
    if (!request.name || !request.email) {
      throw new ValidationError('Missing required fields: name, email');
    }
  }

  private toPublic(user: User): UserPublic {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
