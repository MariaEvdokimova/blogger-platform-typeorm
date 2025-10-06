export class CreateSecurityDeviceDto {
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string;
  iat?: number;
  exp?: number;
}
