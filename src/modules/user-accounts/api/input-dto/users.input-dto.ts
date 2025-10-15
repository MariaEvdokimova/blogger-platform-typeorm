import { IsStringWithTrim } from "../../../../core/decorators/validation/is-string-with-trim";
import { IsEmail, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { emailConstraints, loginConstraints, passwordConstraints } from "../../domain/entities/user.entity";

export class CreateUserInputDto {
  @ApiProperty({
    minLength: loginConstraints.minLength,
    maxLength: loginConstraints.maxLength,
    example: 'string',
    pattern: loginConstraints.match.toString(), // Преобразуем RegExp в строку
  })
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  @Matches(loginConstraints.match)
  login: string;

  @ApiProperty({
    minLength: passwordConstraints.minLength,
    maxLength: passwordConstraints.maxLength,
    example: 'string',
  })
  @IsStringWithTrim(passwordConstraints.minLength, passwordConstraints.maxLength)
  password: string;

  @ApiProperty({
    pattern: emailConstraints.match.toString(), // Преобразуем RegExp в строку
    example: 'string@example.com',
    description: 'must be unique'
  })
  @IsStringWithTrim(emailConstraints.minLength, emailConstraints.maxLength)
  @IsEmail()
  //@Matches(emailConstraints.match)
  email: string;
}
