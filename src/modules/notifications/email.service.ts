import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor( private mailerService: MailerService ) {}

  async sendConfirmationEmail( 
    email: string, 
    code: string,
    template: (code: string) => string
   ): Promise<void> {
    await this.mailerService.sendMail({
      from: 'blplatform@yandex.com',
      to: email,
      subject: 'Your code is here',
      html: template(code),
    });
  }
}
