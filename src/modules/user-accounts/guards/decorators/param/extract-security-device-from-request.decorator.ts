import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { SecurityDeviceContextDto } from 'src/modules/user-accounts/dto/security-device-context.dto';

export const ExtractSecurityDeviceFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): SecurityDeviceContextDto => {
    const request = context.switchToHttp().getRequest();

    const securityContext = request.securityContext;

    if (!securityContext) {      
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'there is no securityContext in the request object!',
      });
    }

    return securityContext;
  },
);
