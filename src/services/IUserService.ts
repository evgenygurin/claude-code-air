import { UserPublic, CreateUserRequest, UpdateUserRequest } from '../types';

export interface IUserService {
  getAllUsers(): UserPublic[];
  getUserById(id: string): UserPublic;
  createUser(request: CreateUserRequest): UserPublic;
  updateUser(id: string, request: UpdateUserRequest): UserPublic;
  deleteUser(id: string): void;
}
