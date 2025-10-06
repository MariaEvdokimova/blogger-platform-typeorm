import { IsStringWithTrim } from "../../../../core/decorators/validation/is-string-with-trim";
import { Matches } from "class-validator";
import { emailConstraints } from "../../domain/entities/user.entity";

export class PasswordRecoveryInputDto {
  @IsStringWithTrim(emailConstraints.minLength, emailConstraints.maxLength)
  @Matches(emailConstraints.match)
  email: string
}
