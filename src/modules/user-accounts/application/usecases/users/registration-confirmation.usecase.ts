import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { RegistrationConfirmationInputDto } from "../../../../user-accounts/api/input-dto/registration-confirmation.input-dto";
import { UsersRepository } from "../../../../user-accounts/infrastructure/users.repository";
import { EmailConfirmationRepository } from "src/modules/user-accounts/infrastructure/email-confirmation.repository";

export class RegistrationConfirmationCommand {
  constructor(public dto: RegistrationConfirmationInputDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute({ dto }: RegistrationConfirmationCommand): Promise<void> {
    const emailConfirmation = await this.emailConfirmationRepository.findUserByConfirmationCode( dto.code );
    if ( !emailConfirmation 
      || emailConfirmation.isEmailConfirmed === true
      || emailConfirmation.confirmationCode !== dto.code
      ||( emailConfirmation.expirationDate && emailConfirmation.expirationDate < new Date())
    ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Code incorrect',
        extensions: [{
          message: 'Code incorrect',
          field: 'code'
        }]
      });
    }

    emailConfirmation.isEmailConfirmed = true;
    await this.emailConfirmationRepository.save( emailConfirmation );
  }
}
    