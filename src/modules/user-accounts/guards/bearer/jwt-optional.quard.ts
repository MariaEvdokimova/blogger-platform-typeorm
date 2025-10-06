import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    // console.log('GUARD >>> err:', err);
    // console.log('GUARD >>> user:', user);
    // console.log('GUARD >>> info:', info);

     if (err || !user) {
      return undefined;
    }

    return user;
  }
}
