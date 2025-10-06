import { OmitType } from '@nestjs/swagger';
import { User } from '../../domain/entities/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user.id.toString();
    dto.email = user.email;
    dto.login = user.login;
    dto.createdAt = user.createdAt;

    return dto;
  }
}

//https://docs.nestjs.com/openapi/mapped-types
export class MeViewDto extends OmitType(UserViewDto, [
  'createdAt',
  'id',
] as const) {
  userId: string;

  static mapToView(user: User): MeViewDto {
    const dto = new MeViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.userId = user.id!.toString();

    return dto;
  }
}
