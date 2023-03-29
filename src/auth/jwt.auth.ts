import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction } from 'express';

interface IRequest extends Request {
  user?: {
    email: string;
  };
}

/**
 * A strategy for passport that uses JWT (JSON Web Token) for authentication
 * Pass in as decorator @UseGuards(AuthGuard('jwt')) above controller
 */
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: IRequest, res: Response, next: NextFunction) {
    const headers = req.headers as { authorization?: string };
    const token = headers.authorization.split(' ')[1];
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SIGNING_SECRET,
    });
    req.user = decoded;
    next();
  }
}
