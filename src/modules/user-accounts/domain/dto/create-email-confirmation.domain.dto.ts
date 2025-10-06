export class CreateEmailConfirmationDomainDto {
  userId: number;
  isEmailConfirmed: boolean;
  expirationDate: Date | null;
  confirmationCode: string | null;  
}
