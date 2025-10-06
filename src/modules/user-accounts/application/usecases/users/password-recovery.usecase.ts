import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../../user-accounts/infrastructure/users.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { PasswordRecoveryInputDto } from "../../../../user-accounts/api/input-dto/password-recovery.input-dto";
import { UuidService } from "../../services/uuid.service";
import { UserRegisteredEvent } from "../../../../user-accounts/domain/events/user-registered.event";
import { EmailExamples } from "../../../../notifications/email-examples";
import { EmailConfirmationRepository } from "src/modules/user-accounts/infrastructure/email-confirmation.repository";

export class PasswordRecoveryCommand {
  constructor(public dto: PasswordRecoveryInputDto) {}
}

/**
 * Создание администратором пользователя через админскую панель
 */
@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private uuidService: UuidService,
    private eventBus: EventBus,
    private emailExamples: EmailExamples,
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute({ dto }: PasswordRecoveryCommand): Promise<void> {
    try {
      const user = await this.usersRepository.findByEmail( dto.email );

      if ( !user ) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: ''         
        })
      }

      const code = this.uuidService.generate();
      await this.emailConfirmationRepository.updateEmailConfirmationCode( code, user.id! );

      this.eventBus.publish(new UserRegisteredEvent(user.email, code, this.emailExamples.passwordRecoveryEmail));
    } catch {
      //transaction.rollback();
    }
  }
}
