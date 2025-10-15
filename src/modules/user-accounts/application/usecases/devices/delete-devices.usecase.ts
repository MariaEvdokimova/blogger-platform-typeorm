import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DomainExceptionCode } from "@src/core/exceptions/domain-exception-codes";
import { DomainException } from "@src/core/exceptions/domain-exceptions";
import { SecurityDeviceRepository } from "@src/modules/user-accounts/infrastructure/security-devices.repository";

export class DeleteDevicesCommand {
  constructor(
    public dto: {
      userId: number,
      deviceId: string
    }
  ) {}
}

@CommandHandler(DeleteDevicesCommand)
export class DeleteDevicesUseCase
  implements ICommandHandler<DeleteDevicesCommand, void>
{
  constructor(private securityDeviceRepository: SecurityDeviceRepository) {
    //console.log('DeleteDevicesUseCase created');
  }

  async execute({ dto }: DeleteDevicesCommand): Promise<void> {
    const deleteCount = await this.securityDeviceRepository.deleteOtherSessions( dto.userId, dto.deviceId);

    if ( deleteCount < 1 ) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not fouund',
      });
    }

    return;
  }
}
