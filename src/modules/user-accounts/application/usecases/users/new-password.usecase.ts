import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../../../modules/user-accounts/infrastructure/users.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { NewPasswordInputDto } from "../../../../../modules/user-accounts/api/input-dto/new-password.input-dto";
import { CryptoService } from "../../services/crypto.service";
import { EmailConfirmationRepository } from "@src/modules/user-accounts/infrastructure/email-confirmation.repository";

export class NewPasswordCommand {
  constructor(public dto: NewPasswordInputDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase
  implements ICommandHandler<NewPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute({ dto }: NewPasswordCommand): Promise<void> {
    const { newPassword, recoveryCode } = dto;
    
    const emailConfirmation = await this.emailConfirmationRepository.findUserByConfirmationCode( recoveryCode );
    if ( !emailConfirmation 
      || (emailConfirmation.expirationDate && emailConfirmation.expirationDate < new Date())
    ){
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Code incorrect',
      });      
    }

    const passwordHash = await this.cryptoService.createPasswordHash( newPassword );
    await this.usersRepository.updatePasswordHash( passwordHash, emailConfirmation.userId );
  }
}
