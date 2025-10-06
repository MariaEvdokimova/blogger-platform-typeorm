import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UserContextDto } from '../../dto/user-context.dto';
import { AuthService } from '../../application/services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  //validate возвращает то, что впоследствии будет записано в req.user
  async validate(loginOrEmail: string, password: string): Promise<UserContextDto> {
      const user = await this.authService.validateUser(loginOrEmail, password);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid username or password',
      });
      
    }

    return user;
  }
}
