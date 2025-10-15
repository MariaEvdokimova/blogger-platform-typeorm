import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DomainExceptionCode } from "@src/core/exceptions/domain-exception-codes";
import { DomainException } from "@src/core/exceptions/domain-exceptions";
import { SecurityDeviceRepository } from "@src/modules/user-accounts/infrastructure/security-devices.repository";


export class DeleteDeviceByIdCommand {
  constructor(
    public dto: {
      userId: number,
      deviceId: string
    }
  ) {}
}

@CommandHandler(DeleteDeviceByIdCommand)
export class DeleteDeviceByIdUseCase
  implements ICommandHandler<DeleteDeviceByIdCommand, void>
{
  constructor(private securityDeviceRepository: SecurityDeviceRepository) {
    //console.log('DeleteDeviceByIdUseCase created');
  }

  async execute({ dto }: DeleteDeviceByIdCommand): Promise<void> {
    const DeviceIdCheck = await this.securityDeviceRepository.findUserByDeviceId( dto.deviceId );
    
    if ( !DeviceIdCheck ) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not found',
      });
    }

    if ( DeviceIdCheck.userId !== dto.userId ){
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'forbidden',
      });
    }

    const deleteCount = await this.securityDeviceRepository.deleteById( dto.userId, dto.deviceId );
    if ( deleteCount < 1 ) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not found',
      });
    }
    
    return;
  }
}
