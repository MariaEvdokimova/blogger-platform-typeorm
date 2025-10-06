import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserDto } from "../../../../user-accounts/dto/create-user.dto";
import { UsersRepository } from "../../../../user-accounts/infrastructure/users.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { UuidService } from "../../services/uuid.service";
import { EmailExamples } from "../../../../notifications/email-examples";
import { UserRegisteredEvent } from "../../../../user-accounts/domain/events/user-registered.event";
import { UsersFactory } from "../../factories/users.factory";
import { EmailConfirmationRepository } from "src/modules/user-accounts/infrastructure/email-confirmation.repository";
import { EmailConfirmationFactory } from "../../factories/email-confirmation.factory";
import { add } from "date-fns/add";

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

/**
 * Регистрация пользователя через email на странице регистрации сайта
 */
@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private eventBus: EventBus,
    private usersRepository: UsersRepository,
    private usersFactory: UsersFactory,
    private uuidService: UuidService,
    private emailExamples: EmailExamples,
    private emailConfirmationFactory: EmailConfirmationFactory,
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
      const userWithTheSameLoginOrMail = await this.usersRepository.doesExistByLoginOrEmail(
        dto.login,
        dto.email,
      );

      if ( userWithTheSameLoginOrMail ) {
        if ( userWithTheSameLoginOrMail.email === dto.email ) {
          throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'User with the same emil already exists',
          extensions: [{
            message: 'User with the same email already exists',
            field: 'email'
          }]
        });
        } else {  
          throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'User with the same login already exists',
          extensions: [{
            message: 'User with the same login already exists',
            field: 'login'
          }]
        });
        }
      }
    
      const user = await this.usersFactory.create(dto);
      const createdUser = await this.usersRepository.save(user);
      
      const confirmCode = this.uuidService.generate();      
      const emailConfirmation = this.emailConfirmationFactory.create(
        { 
          userId: createdUser.id, 
          confirmationCode: confirmCode,
          expirationDate: add(new Date(), { hours: 1 }),
        })

      await this.emailConfirmationRepository.save(emailConfirmation);
    
      this.eventBus.publish(new UserRegisteredEvent(user.email, confirmCode, this.emailExamples.registrationEmail));
  }
}
