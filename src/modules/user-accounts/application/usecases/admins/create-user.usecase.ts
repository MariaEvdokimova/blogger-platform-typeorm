import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserDto } from "../../../../user-accounts/dto/create-user.dto";
import { UsersRepository } from "../../../../user-accounts/infrastructure/users.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { UsersFactory } from "../../factories/users.factory";
import { EmailConfirmationFactory } from "../../factories/email-confirmation.factory";
import { EmailConfirmationRepository } from "src/modules/user-accounts/infrastructure/email-confirmation.repository";

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}
/**
 * Создание администратором пользователя через админскую панель
 */
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, number>
{
  constructor(
    private usersRepository: UsersRepository,
    private usersFactory: UsersFactory,
    private emailConfirmationFactory: EmailConfirmationFactory,
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<number> {
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
    const userCreated = await this.usersRepository.save(user);
    const emailConfirmation = this.emailConfirmationFactory.create({ userId: userCreated.id, isEmailConfirmed: true})
    await this.emailConfirmationRepository.save(emailConfirmation);

    return userCreated.id;
  }
}
