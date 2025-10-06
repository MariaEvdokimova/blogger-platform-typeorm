import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RequestMetadataDto } from '../../dto/request-metadata.dto';

export const RequestMetadata = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return new RequestMetadataDto(
      request.ip || '',
      request.headers['user-agent'] || 'Unknown device',
      request.cookies?.['refreshToken'],
    );
  },
);
