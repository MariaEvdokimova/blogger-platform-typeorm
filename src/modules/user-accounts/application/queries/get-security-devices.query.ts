import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { DeviceViewDto } from "../../api/view-dto/devices.view-dto";
import { SecurityDevicesQueryRepository } from "../../infrastructure/query/security-devices.query-repository";

export class GetSecurityDevicesQuery {
  constructor(public userId: number) {}
}

@QueryHandler(GetSecurityDevicesQuery)
export class GetSecurityDevicesQueryHandler
  implements IQueryHandler<GetSecurityDevicesQuery, DeviceViewDto[]>
{
  constructor(private securityDevicesQueryRepository: SecurityDevicesQueryRepository) {}

  async execute({ userId }: GetSecurityDevicesQuery) {
    return this.securityDevicesQueryRepository.getDevices(userId);
  }
}
