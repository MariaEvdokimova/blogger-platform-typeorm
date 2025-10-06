import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    //console.log('!!!request.user ', request.user);
    const userId = request.user?.id;
    
    if (typeof userId === 'number') {
      return userId;
    }

    if (typeof userId === 'string' && /^\d+$/.test(userId)) {
      return Number(userId);
    }

    return userId;
  },
);
