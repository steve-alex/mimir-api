import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(@Inject('POCKET_BASE') private readonly pb) {}
  getHello(): string {
    return 'Ola Mundo!';
  }

  async login(email: string, password: string): Promise<string> {
    console.log('Email =>', email);
    console.log('Password =>', password);
    return 'Ola Mundo!';
  }

  logout(): string {
    return 'Ola Mundo!';
  }
}
