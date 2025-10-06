import { IsStringWithTrim } from "../../../../core/decorators/validation/is-string-with-trim";
import { IsEmail } from "class-validator";
import { emailConstraints } from "../../domain/entities/user.entity";

export class RegistrationEmailResendingInputDto {
  @IsStringWithTrim(emailConstraints.minLength, emailConstraints.maxLength)
  @IsEmail()
 // @Matches(emailConstraints.match)
  email: string;
}
