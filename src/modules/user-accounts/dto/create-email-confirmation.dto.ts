export class CreateEmailConfirmationDto {
  userId: number;
  isEmailConfirmed?: boolean;
  expirationDate?: Date;
  confirmationCode?: string;  
}
