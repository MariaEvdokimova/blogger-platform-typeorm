import { Injectable } from "@nestjs/common";
import { CreateEmailConfirmationDto } from "../../dto/create-email-confirmation.dto";
import { EmailConfirmation } from "../../domain/entities/email-confirmation.entity";

@Injectable()
export class EmailConfirmationFactory {
  constructor(
  ) {}
  
  create(dto: CreateEmailConfirmationDto): EmailConfirmation {
    const emailConfirmation = new EmailConfirmation();
      emailConfirmation.userId = dto.userId,
      emailConfirmation.isEmailConfirmed = dto.isEmailConfirmed ?? false,
      emailConfirmation.expirationDate = dto.expirationDate ?? null,
      emailConfirmation.confirmationCode = dto.confirmationCode ?? null

    return emailConfirmation;
  }
}
