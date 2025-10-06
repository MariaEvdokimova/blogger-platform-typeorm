import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SecurityDevice } from "../domain/entities/security-device.entity";
import { Not, Repository } from "typeorm";

@Injectable()
export class SecurityDeviceRepository {

  constructor(
    @InjectRepository( SecurityDevice )
    private securityDevice: Repository<SecurityDevice>,
  ) {}

  async save(device: SecurityDevice): Promise<SecurityDevice> {
    return await this.securityDevice.save( device );
  }

  async updateIatAndExp( iat: number, exp: number, deviceId: string ): Promise<void>{
    const iatDTFormat = new Date(iat * 1000);
    const expDTFormat = new Date(exp * 1000);
    
    await this.securityDevice.update(
      { deviceId },
      { iat: iatDTFormat, exp: expDTFormat }
    );
    return;
  }

  async findByDeviceIdAndUserId(
    { deviceId, userId }: { deviceId: string, userId: number }
  ): Promise<SecurityDevice | null> {
    return this.securityDevice.findOne({
      where: { deviceId, userId }
    });
  }

  async findUserByDeviceId( deviceId: string):  Promise< SecurityDevice | null> {
    return this.securityDevice.findOneBy({ deviceId });
  }

  async isSessionValid (
    userId: number,
    deviceId: string,
    iat: number,
    exp: number
  ): Promise<boolean> {
    const session = await this.securityDevice.findOne({
      where: { 
        userId, 
        deviceId, 
        iat: new Date(iat * 1000), 
        exp: new Date(exp * 1000) }
    })

    if ( !session || !session.exp ) return false;

    const now = new Date();

    return session.exp.getTime() > now.getTime();
  }

  async deleteById ( userId: number, deviceId: string ): Promise<number> {
    const result = await this.securityDevice.delete({ userId, deviceId });
    return result.affected ? result.affected : 0 
  }

  async deleteOtherSessions ( userId: number, deviceId: string ): Promise<number> {
    const devicesToDelete = await this.securityDevice.find({
      where: {
        userId,
        deviceId: Not(deviceId),
      },
    });

    const result = await this.securityDevice.remove( devicesToDelete );
    return result.length;
  }

}
