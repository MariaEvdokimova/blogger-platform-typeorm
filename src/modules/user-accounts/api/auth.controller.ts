import { Response } from 'express';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiSecurity } from "@nestjs/swagger";
import { CreateUserInputDto } from "./input-dto/users.input-dto";
import { RegistrationConfirmationInputDto } from "./input-dto/registration-confirmation.input-dto";
import { RegistrationEmailResendingInputDto } from "./input-dto/registration-email-resending.input-dto";
import { UserContextDto } from "../dto/user-context.dto";
import { ExtractUserFromRequest } from "../guards/decorators/param/extract-user-from-request.decorator";
import { LocalAuthGuard } from "../guards/local/local-auth.guard";
import { JwtAuthGuard } from "../guards/bearer/jwt-auth.guard";
import { MeViewDto } from "./view-dto/users.view-dto";
import { PasswordRecoveryInputDto } from "./input-dto/password-recovery.input-dto";
import { NewPasswordInputDto } from "./input-dto/new-password.input-dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { RegisterUserCommand } from "../application/usecases/users/register-user.usecase";
import { LoginUserCommand } from "../application/usecases/users/login-user.usecase";
import { PasswordRecoveryCommand } from "../application/usecases/users/password-recovery.usecase";
import { NewPasswordCommand } from "../application/usecases/users/new-password.usecase";
import { RegistrationConfirmationCommand } from "../application/usecases/users/registration-confirmation.usecase";
import { RegistrationEmailResendingCommand } from "../application/usecases/users/registration-email-resending.usecase";
import { GetMeQuery } from "../application/queries/get-me.query";
import { RequestMetadata } from "../guards/decorators/request-metadata.decorator";
import { RequestMetadataDto } from "../dto/request-metadata.dto";
import { CookieService } from '../application/services/cookie.service';
import { JwtRefreshTokenGuard } from '../guards/refresh-token/jwt-refresh-token.guard';
import { ExtractSecurityDeviceFromRequest } from '../guards/decorators/param/extract-security-device-from-request.decorator';
import { SecurityDeviceContextDto } from '../dto/security-device-context.dto';
import { RefreshTokenCommand } from '../application/usecases/users/refresh-token.usecase';
import { LogoutCommand } from '../application/usecases/users/logout-user.usecase';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('login')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        loginOrEmail: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword' },
      },
    },
  })
  async login(
    @RequestMetadata() metadata: RequestMetadataDto,
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      { accessToken: string, refreshToken: string }
    >(new LoginUserCommand({ userId: user.id, metadata }));

    CookieService.setRefreshTokenCookie( response, refreshToken );
    return { accessToken };
  }

  @ApiSecurity('refreshToken') 
  @Post('refresh-token')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @ExtractSecurityDeviceFromRequest() context: SecurityDeviceContextDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }>  {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      RefreshTokenCommand,
      { accessToken: string, refreshToken: string }
    >(new RefreshTokenCommand({ userId: context.userId, deviceId: context.deviceId }));

    CookieService.setRefreshTokenCookie( response, refreshToken );
    return { accessToken };
  }  

  @Post('password-recovery')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  passwordRecovery(@Body() body: PasswordRecoveryInputDto): Promise<void>{
    return this.commandBus.execute(new PasswordRecoveryCommand( body ));
  }

  @Post('new-password')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  newPassword (@Body() body: NewPasswordInputDto): Promise<void>{
    return this.commandBus.execute(new NewPasswordCommand( body ));
  }

  @Post('registration')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }
  
  @Post('registration-confirmation')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationConfirmation(@Body() body: RegistrationConfirmationInputDto): Promise<void> {
    return this.commandBus.execute(new RegistrationConfirmationCommand( body ));
  }

  @Post('registration-email-resending')
  @SkipThrottle({ default: false }) // Rate limiting is applied to this route.
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationEmailResending(@Body() body: RegistrationEmailResendingInputDto): Promise<void> {
    return this.commandBus.execute(new RegistrationEmailResendingCommand( body ));
  }

  @ApiSecurity('refreshToken') 
  @Post('logout')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @ExtractSecurityDeviceFromRequest() context: SecurityDeviceContextDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.commandBus.execute(new LogoutCommand({ userId: context.userId, deviceId: context.deviceId }));
    CookieService.clearRefreshTokenCookie( response );
  }

  @ApiBearerAuth('JwtAuth')
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.queryBus.execute( new GetMeQuery( user )); 
  }
}
