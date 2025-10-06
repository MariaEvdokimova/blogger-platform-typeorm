import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBasicAuth, ApiParam } from '@nestjs/swagger';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UserViewDto } from './view-dto/users.view-dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/usecases/admins/create-user.usecase';
import { DeleteUserCommand } from '../application/usecases/admins/delete-user.usecase';
import { GetUsersQuery } from '../application/queries/get-users.query';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('sa/users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,    
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    //console.log('UsersController created');
  }
 
  @Get()
  getAll(@Query() query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.queryBus.execute(new GetUsersQuery( query ));
  }
 
  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    
    const userId = await this.commandBus.execute<
      CreateUserCommand,
      number
    >(new CreateUserCommand(body));     
    return this.usersQueryRepository.getByIdOrNotFoundFail( userId );
  }
 
  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
