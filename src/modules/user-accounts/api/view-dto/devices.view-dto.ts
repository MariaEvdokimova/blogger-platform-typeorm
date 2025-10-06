export class DeviceViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(device): DeviceViewDto {
    const dto = new DeviceViewDto();
    dto.ip = device.ip;
    dto.title = device.deviceName;
    dto.lastActiveDate = device.iat ? device.iat.toISOString() : '';
    dto.deviceId = device.deviceId.toString();

    return dto;
  }
}
