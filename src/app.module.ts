// import of this config module must be on the top of imports
import { configModule } from './config-dynamic-module';
import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TestingModule } from './modules/testing/testing.modules';
import { ConfigService } from '@nestjs/config';
import { type DatabaseConfig } from './core/db/db.config';

@Module({
  imports: [    
    configModule,  // 🔝 всегда первым!

    TypeOrmModule.forRootAsync({
      useFactory(config: ConfigService<DatabaseConfig>) {
        const dbConfig = config.get<DatabaseConfig['database']>('database', {
        infer: true,
      });

      if (!dbConfig) {
        throw new Error('Database configuration is missing');
      }

      return {
        ...dbConfig,
        autoLoadEntities: true,
      };
    },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000, // Время жизни в секундах 
          limit: 100000000000000000, // Максимум 5 запросов 100000000000000000 // 5
        },
      ],
    }),
    
    UserAccountsModule,
    TestingModule,
    BloggersPlatformModule,
    CoreModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [
    //регистрация глобальных exception filters
    //важен порядок регистрации! Первым сработает DomainHttpExceptionsFilter!
    //https://docs.nestjs.com/exception-filters#binding-filters
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    // чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS

    return {
      module: AppModule,
      imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])], // Add dynamic modules here
    };
  }
}
