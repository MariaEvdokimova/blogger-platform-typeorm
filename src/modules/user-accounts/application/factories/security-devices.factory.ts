import { Injectable } from "@nestjs/common";
import { CreateSecurityDeviceDto } from "../../dto/create-security-device.dto";
import { SecurityDevice } from "../../domain/entities/security-device.entity";

@Injectable()
export class SecurityDevicesFactory {
  constructor(
  ) {}
  
  async create(dto: CreateSecurityDeviceDto): Promise<SecurityDevice> {
     const securityDevice = new SecurityDevice();
      securityDevice.userId = Number(dto.userId),
      securityDevice.deviceName = dto.deviceName,
      securityDevice.deviceId = dto.deviceId,
      securityDevice.ip = dto.ip,
      securityDevice.iat = dto.iat ? new Date(dto.iat * 1000) : null,
      securityDevice.exp = dto.exp ? new Date(dto.exp * 1000) : null

    return securityDevice;
  }
}
