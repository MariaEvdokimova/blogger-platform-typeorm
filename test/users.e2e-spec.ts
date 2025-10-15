import request from 'supertest';
import { HttpStatus, INestApplication } from "@nestjs/common";
import { UsersTestManager } from "./helpers/users-test-manager";
import { initSettings } from "./helpers/init-settings";
import { JwtService } from "@nestjs/jwt";
import { deleteAllData } from "./helpers/delete-all-data";
import { delay } from "./helpers/delay";
import { CreateUserDto } from "../src/modules/user-accounts/dto/create-user.dto";
import { PaginatedViewDto } from "../src/core/dto/base.paginated.view-dto";
import { MeViewDto, UserViewDto } from "../src/modules/user-accounts/api/view-dto/users.view-dto";
import { EmailService } from "../src/modules/notifications/email.service";
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { ConfigService } from '@nestjs/config';

describe('users', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings(async (moduleBuilder) => {
      return moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (configService: ConfigService) => {
            return new JwtService({
              secret: configService.get('ACCESS_TOKEN_SECRET'),
              signOptions: {
                expiresIn: configService.get('ACCESS_TOKEN_EXPIRE_IN'),
              },
            });
          },
          inject: [ConfigService],
        })
    });
    
    app = result.app;
    userTestManger = result.userTestManger;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('should create user', async () => {
    const body: CreateUserDto = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.em',
    };

    const response = await userTestManger.createUser(body);

    expect(response).toEqual({
      login: body.login,
      email: body.email,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  // it('should get users with paging', async () => {
  //   const users = await userTestManger.createSeveralUsers(12);
  //   const { body: responseBody } = (await request(app.getHttpServer())
  //     .get(`/sa/users?pageNumber=2&sortDirection=asc`) 
  //     .auth('admin', 'qwerty')
  //     .expect(HttpStatus.OK)) as { body: PaginatedViewDto<UserViewDto> };

  //   expect(responseBody.totalCount).toBe(12);
  //   expect(responseBody.items).toHaveLength(2);
  //   expect(responseBody.pagesCount).toBe(2);
  //   //asc sorting
  //   expect(responseBody.items[1]).toEqual(users[users.length - 1]);
  // });

  // it('should return users info while "me" request with correct accessTokens', async () => {
  //   const tokens = await userTestManger.createAndLoginSeveralUsers(1);

  //   const responseBody = await userTestManger.me(tokens[0].accessToken);

  //   expect(responseBody).toEqual({
  //     login: expect.anything(),
  //     userId: expect.anything(),
  //     email: expect.anything(),
  //   } as MeViewDto);
  // });

  // it(`shouldn't return users info while "me" request if accessTokens expired`, async () => {
  //   const tokens = await userTestManger.createAndLoginSeveralUsers(1);
  //   await delay(11000);
  //   await userTestManger.me(tokens[0].accessToken, HttpStatus.UNAUTHORIZED);
  // });

  // it(`should register user without really send email`, async () => {
  //   await request(app.getHttpServer())
  //     .post(`/auth/registration`)
  //     .send({
  //       email: 'email@email.em',
  //       password: '123123123',
  //       login: 'login123',
  //     } as CreateUserDto)
  //     .expect(HttpStatus.NO_CONTENT);
  // });

  // it(`should call email sending method while registration`, async () => {
  //   const sendEmailMethod = (app.get(EmailService).sendConfirmationEmail = jest
  //     .fn()
  //     .mockImplementation(() => Promise.resolve()));

  //   await request(app.getHttpServer())
  //     .post(`/auth/registration`)
  //     .send({
  //       email: 'email@email.em',
  //       password: '123123123',
  //       login: 'login123',
  //     } as CreateUserDto)
  //     .expect(HttpStatus.NO_CONTENT);

  //   expect(sendEmailMethod).toHaveBeenCalled();
  // });
  
});
