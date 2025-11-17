import { ApiResponse } from '../types';

export class ResponseBuilder {
  static success<T>(data?: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static error(error: string): ApiResponse<null> {
    return {
      success: false,
      error,
    };
  }
}
