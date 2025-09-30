import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility } from '../../../setup/config-validation.utility';

@Injectable()
export class NotificationsConfig {
  @IsNotEmpty({
    message: 'Set Env variable EMAIL, notification sent from this email adress',
  })
  email: string;

  @IsNotEmpty({
    message: 'Set Env variable EMAIL_PASS, password for EMAIL',
  })
  emailPass: string;

  @IsNotEmpty({
    message: 'Set Env variable EMAIL_HOST, for ex smtp.yandex.com',
  })
  emailHost: string;

  @IsNumber(
    {},
    {
      message: 'Set Env variable EMAIL_PORT, example: 465',
    },
  )
  emailPort: number;

  constructor(private configService: ConfigService<any, true>) {
    this.email = this.configService.get('EMAIL');
    this.emailPass = this.configService.get('EMAIL_PASS');
    this.emailHost = this.configService.get('EMAIL_HOST');
    this.emailPort = Number(this.configService.get('EMAIL_PORT'));
    configValidationUtility.validateConfig(this);
  }
}
