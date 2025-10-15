import { Inject } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from "../../../../user-accounts/constants/auth-tokens.inject-constants";
import { RequestMetadataDto } from "../../../../user-accounts/dto/request-metadata.dto";
import { SecurityDeviceRepository } from "@src/modules/user-accounts/infrastructure/security-devices.repository";
import { SecurityDevicesFactory } from "../../factories/security-devices.factory";
import { UuidService } from "../../services/uuid.service";
import { SecurityDevice } from "@src/modules/user-accounts/domain/entities/security-device.entity";

export class LoginUserCommand {
  constructor(
    public dto: {
      userId: string,
      metadata: RequestMetadataDto
    }) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private securityDevicesRepository: SecurityDeviceRepository,
    private readonly securityDevicesFactory: SecurityDevicesFactory,
    private uuidService: UuidService,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<{ accessToken: string, refreshToken: string }> {
    let existingDevice;
    let payload;

    try {
      if (dto.metadata.refreshToken) {
        payload = await this.refreshTokenContext.verify(dto.metadata.refreshToken);
  
        existingDevice = await this.securityDevicesRepository.findByDeviceIdAndUserId({
          deviceId: payload.deviceId,
          userId: Number(payload.id),
        });
      }
    } catch (error) {
      console.log("Refres Token verify some error ", error);
    }

    const deviceId = existingDevice
    ? payload.deviceId
    : this.uuidService.generate();

    const accessToken = this.accessTokenContext.sign({
      id: dto.userId,
    });

    const refreshToken = this.refreshTokenContext.sign({
      id: dto.userId,
      deviceId, 
    });

  const createdRefresTokenPayload = await this.refreshTokenContext.verify(refreshToken);

  let device: SecurityDevice;

  if (existingDevice) {    
    existingDevice.ip = dto.metadata.ip;
    existingDevice.deviceName = dto.metadata.userAgent;
    existingDevice.iat = new Date(createdRefresTokenPayload.iat * 1000); 
    existingDevice.exp = new Date(createdRefresTokenPayload.exp * 1000); 
    existingDevice.updatedAt = new Date();

    device = existingDevice;
  } else {
    device = await this.securityDevicesFactory.create({
      userId: dto.userId,
      deviceId,
      deviceName: dto.metadata.userAgent,
      ip: dto.metadata.ip,
      iat: createdRefresTokenPayload.iat,
      exp: createdRefresTokenPayload.exp,
    });
  }
   await this.securityDevicesRepository.save( device ); 

 console.log('!!!refreshToken !!!!!!!!!!!! ', refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}
