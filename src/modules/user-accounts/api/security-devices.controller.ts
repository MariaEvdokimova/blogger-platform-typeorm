import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from "@nestjs/common";
import { ApiParam, ApiSecurity } from "@nestjs/swagger";
import { DeviceViewDto } from "./view-dto/devices.view-dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetSecurityDevicesQuery } from "../application/queries/get-security-devices.query";
import { ObjectUUIdValidationPipe } from "src/core/pipes/object-id-validation-transformation-pipe.service";
import { DeleteDevicesCommand } from "../application/usecases/devices/delete-devices.usecase";
import { DeleteDeviceByIdCommand } from "../application/usecases/devices/delete-device-by-id.usecase";
import { SecurityDeviceContextDto } from "../dto/security-device-context.dto";
import { JwtRefreshTokenGuard } from "../guards/refresh-token/jwt-refresh-token.guard";
import { ExtractSecurityDeviceFromRequest } from "../guards/decorators/param/extract-security-device-from-request.decorator";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiSecurity('refreshToken') 
  @Get()
  @UseGuards(JwtRefreshTokenGuard)
  getDevices(@ExtractSecurityDeviceFromRequest() context: SecurityDeviceContextDto): Promise<DeviceViewDto[]> {
    return this.queryBus.execute( new GetSecurityDevicesQuery( Number(context.userId) )); 
  }

  @ApiSecurity('refreshToken') 
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  @UseGuards(JwtRefreshTokenGuard)
  deleteDevices(@ExtractSecurityDeviceFromRequest() context: SecurityDeviceContextDto): Promise<void> {
    return this.commandBus.execute(new DeleteDevicesCommand({ userId: Number(context.userId), deviceId: context.deviceId }));
  } 

  @ApiSecurity('refreshToken') 
  @ApiParam({ name: 'deviceId' })
  @Delete(':deviceId')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDeviceById(
    @Param('deviceId', ObjectUUIdValidationPipe) deviceId: string, 
    @ExtractSecurityDeviceFromRequest() context: SecurityDeviceContextDto
  ): Promise<void>  {
    return this.commandBus.execute(new DeleteDeviceByIdCommand({ userId: Number(context.userId), deviceId }));
  }
}