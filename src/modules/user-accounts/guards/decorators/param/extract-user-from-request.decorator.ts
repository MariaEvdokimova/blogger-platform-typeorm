import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { UserContextDto } from '../../../../../modules/user-accounts/dto/user-context.dto';

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContextDto => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {      
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'there is no user in the request object!',
      });
      //throw new Error('there is no user in the request object!');
    }

    return user;
  },
);
