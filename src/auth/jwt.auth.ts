import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * A strategy for passport that uses JWT (JSON Web Token) for authentication
 * Pass in as decorator @UseGuards(AuthGuard('jwt')) above controller
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    console.log('Something is being constructred!');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECRET_KEY',
    });
  }

  async validate(payload: any) {
    console.log('Validate!');
    return { status: 'OK' };
  }
}
