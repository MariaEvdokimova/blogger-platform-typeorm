export class CreateSecurityDeviceDto {
  userId: number;
  deviceId: string;
  deviceName: string;
  ip: string;
  iat: Date | null;
  exp: Date | null;
}
