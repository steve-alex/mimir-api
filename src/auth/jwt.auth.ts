import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth/auth.service';

/**
 * A strategy for passport that uses JWT (JSON Web Token) for authentication
 * Pass in as decorator @UseGuards(AuthGuard('jwt')) above controller
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SIGNING_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const { email, accountId } = payload;
    const user = await this.authService.validate(email, accountId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
