import { Inject } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";
import { DomainException } from "src/core/exceptions/domain-exceptions";
import { SecurityDeviceRepository } from "src/modules/user-accounts/infrastructure/security-devices.repository";

export class LogoutCommand {
  constructor(
    public dto: {
      userId: string,
      deviceId: string
    }) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private securityDeviceRepository: SecurityDeviceRepository,
  ) {}

  async execute({ dto }: LogoutCommand): Promise<void> {
    const deleteCount = await this.securityDeviceRepository.deleteById( Number(dto.userId), dto.deviceId );
    if ( deleteCount < 1 ) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not found',
      });
    }
    return;
  }
}
