import { ApiProperty } from "@nestjs/swagger";
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { passwordConstraints } from "../../domain/entities/user.entity";

export class NewPasswordInputDto {
  @ApiProperty({
    minLength: passwordConstraints.minLength,
    maxLength: passwordConstraints.maxLength,
  })
  @IsStringWithTrim(passwordConstraints.minLength, passwordConstraints.maxLength)
  newPassword: string;
  recoveryCode: string;
}
