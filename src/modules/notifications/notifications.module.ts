import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { SendConfirmationEmailWhenUserRegisteredEventHandler } from './application/event-handlers/send-confirmation-email-when-user-registered.event-handler';
import { NotificationsConfig } from './config/notifications.config';
import { NotificationsInternalModule } from './config/notifications.internal-module';

@Module({
  imports: [
    NotificationsInternalModule,
    MailerModule.forRootAsync({
      useFactory: async (config: NotificationsConfig) => ({
        transport: {
          host: config.emailHost,
          port: config.emailPort,
          secure: true,
          auth: {
            user: config.email,
            pass: config.emailPass,
          }
        },
        defaults: {
          from: `"No Reply" <${config.email}>`,
        },
      }),
      inject: [NotificationsConfig],
      imports: [NotificationsInternalModule],
      /*
      transport: {
        host: 'smtp.yandex.com',//process.env.EMAIL_HOST,
        port: 465,//+process.env.EMAIL_PORT! as number,
        secure: true,
        auth: {
          user: 'blplatform@yandex.com',//process.env.EMAIL,
          pass: 'unywtxninqibyyji',//process.env.EMAIL_PASS
        }
      },
      defaults: {
        from: '<blplatform@yandex.com>',
      },*/
    }),
  ],
  providers: [
    EmailService,
    SendConfirmationEmailWhenUserRegisteredEventHandler,
  ],
  exports: [EmailService],
})
export class NotificationsModule {}
