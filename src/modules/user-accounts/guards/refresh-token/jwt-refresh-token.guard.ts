import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { cookieConfig } from "@src/core/config/cookie.config";
import { RequestWithCookies } from "./request-with-cookies";
import { DomainException } from "@src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@src/core/exceptions/domain-exception-codes";
import { JwtService } from "@nestjs/jwt";
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from "../../constants/auth-tokens.inject-constants";
import { SecurityDeviceRepository } from "../../infrastructure/security-devices.repository";

@Injectable()
export class JwtRefreshTokenGuard implements CanActivate  {
  constructor(
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly jwtService: JwtService,

    private readonly securityDeviceRepository: SecurityDeviceRepository,
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {  
    const request = context.switchToHttp().getRequest<RequestWithCookies>();
    const refreshToken = request.cookies?.[cookieConfig.refreshToken.name];
console.log('!!!!!!refreshToken ', refreshToken);
    if (!refreshToken) {
      console.log('1')
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch (error) {
      console.log('2', error)
    }

    console.log('*****************refreshToken ', refreshToken);
    //console.log('payload?.id; ', payload?.id)     
       
    const id = payload?.id;
    const deviceId = payload?.deviceId;
    const iat = payload?.iat;
    const exp = payload?.exp;

    // Проверка обязательных полей
    if (!iat || !exp) {
      console.log('3')
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    // Проверка корректности deviceId
    /*if (!Types.ObjectId.isValid(deviceId)) {
      console.log('4')
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }
    */

    // Поиск сессии в БД
    const isValidSession = await this.securityDeviceRepository.isSessionValid( id, deviceId, iat, exp );

    if (!isValidSession) {
      console.log('5')
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    request.securityContext = {
      userId: id,
      deviceId,
    };

    return true;
  }
}
