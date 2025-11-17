export class IdGenerator {
  static generate(prefix: string = 'id'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `${prefix}_${timestamp}_${random}`;
  }
}
