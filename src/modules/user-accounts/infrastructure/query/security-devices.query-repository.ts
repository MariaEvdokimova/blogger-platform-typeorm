import { Injectable } from '@nestjs/common';
import { DeviceViewDto } from '../../api/view-dto/devices.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SecurityDevice } from '../../domain/entities/security-device.entity';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectRepository( SecurityDevice )
    private securityDevice: Repository<SecurityDevice>,
  ) {}

  async getDevices(userId: number): Promise<DeviceViewDto[]> {
    const now = new Date();

    const result = await this.securityDevice.find({
      where: {
        userId,
        exp: MoreThan(now)
      }
    });

    return result.map(DeviceViewDto.mapToView);
  }
}

