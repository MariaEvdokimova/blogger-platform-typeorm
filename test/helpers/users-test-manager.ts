import { HttpStatus, INestApplication } from "@nestjs/common";
import request from 'supertest';
import { CreateUserInputDto } from "../../src/modules/user-accounts/api/input-dto/users.input-dto";
import { MeViewDto, UserViewDto } from "../../src/modules/user-accounts/api/view-dto/users.view-dto";
import { delay } from "./delay";

export class UsersTestManager {
  constructor(private app: INestApplication) {}

  async createUser(
    createModel: CreateUserInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/sa/users`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);
    return response.body;
  }

  async login(
    loginOrEmail: string,
    password: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<{ accessToken: string }> {
    const response = await request(this.app.getHttpServer())
      .post(`/auth/login`)
      .send({ loginOrEmail, password })
      .expect(statusCode);
    return {
      accessToken: response.body.accessToken,
    };
  }

  async me(
    accessToken: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<MeViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(`/auth/me`)
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);

    return response.body;
  }

  async createSeveralUsers(count: number): Promise<UserViewDto[]> {
    const usersPromises = [] as UserViewDto[];

    for (let i = 0; i < count; ++i) {
      await delay(50);
      const response = await this.createUser({
        login: `test` + i,
        email: `test${i}@gmail.com`,
        password: '123456789',
      });
      usersPromises.push(response);
    }

    return Promise.all(usersPromises);
  }

  async createAndLoginSeveralUsers(
    count: number,
  ): Promise<{ accessToken: string }[]> {
    const users = await this.createSeveralUsers(count);

    const loginPromises = users.map((user: UserViewDto) =>
      this.login(user.login, '123456789'),
    );

    return await Promise.all(loginPromises);
  }
}
