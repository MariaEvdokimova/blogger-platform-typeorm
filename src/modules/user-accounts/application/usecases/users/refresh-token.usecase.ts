import { Inject } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { DomainExceptionCode } from "@src/core/exceptions/domain-exception-codes";
import { DomainException } from "@src/core/exceptions/domain-exceptions";
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from "@src/modules/user-accounts/constants/auth-tokens.inject-constants";
import { UsersQueryRepository } from "@src/modules/user-accounts/infrastructure/query/users.query-repository";
import { SecurityDeviceRepository } from "@src/modules/user-accounts/infrastructure/security-devices.repository";

export class RefreshTokenCommand {
  constructor(
    public dto: {
      userId: string,
      deviceId: string
    }) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private securityDeviceRepository: SecurityDeviceRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute({ dto }: RefreshTokenCommand): Promise<{ accessToken: string, refreshToken: string }> {

    console.log('REFRESH TOKEN!!!!!!!!!!!!!!');
    const user = await this.usersQueryRepository.findById( Number(dto.userId) );
    if ( !user ) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      }); 
    }

    const device = await this.securityDeviceRepository.findByDeviceIdAndUserId({ deviceId: dto.deviceId, userId: Number(dto.userId) });
    if (!device) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not found',
      });
    }

    const accessToken = this.accessTokenContext.sign({
      id: dto.userId,
    });

    const refreshToken = this.refreshTokenContext.sign({
      id: dto.userId,
      deviceId: dto.deviceId, 
    });

    const refreshTokenPayload = await this.refreshTokenContext.verify(refreshToken);
    
    await this.securityDeviceRepository.updateIatAndExp( refreshTokenPayload?.iat, refreshTokenPayload?.exp, dto.deviceId );
  
    //console.log('', refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}
