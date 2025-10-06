import { SecurityDevice } from "../entities/security-device.entity";


export class SecurityDeviceMapper {
  static fromDb(row: any): SecurityDevice {
    const securityDevice = new SecurityDevice();
    securityDevice.userId = row.userId;
    securityDevice.deviceName = row.deviceName;
    securityDevice.deviceId = row.deviceId;
    securityDevice.ip = row.ip;
    securityDevice.iat = row.iat;
    securityDevice.exp = row.exp;
    securityDevice.id = row.id.toString();
    securityDevice.createdAt = row.createdAt;
    securityDevice.updatedAt = row.updatedAt;

    return securityDevice;
  }
}
