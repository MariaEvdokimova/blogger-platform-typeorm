import { Test, TestingModuleBuilder } from "@nestjs/testing";
import { EmailService } from "../../src/modules/notifications/email.service";
import { EmailServiceMock } from "../mock/email-service.mock";
import { appSetup } from "../../src/setup/app.setup";
import { UsersTestManager } from "./users-test-manager";
import { deleteAllData } from "./delete-all-data";
import { AppModule } from "../../src/app.module";
import { BlogsTestManager } from "./blogs-test-manager";
import { PostsTestManager } from "./posts-test-manager";
import { DataSource } from "typeorm";
import { getDataSourceToken } from "@nestjs/typeorm";

export const initSettings = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();
  const app = testingAppModule.createNestApplication();
  appSetup(app, false);
  await app.init();

  const databaseConnection = app.get<DataSource>(getDataSourceToken());
  const httpServer = app.getHttpServer();
  const userTestManger = new UsersTestManager(app);
  const blogsTestManager = new BlogsTestManager(app);
  const postsTestManager = new PostsTestManager(app);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    httpServer,
    userTestManger,
    blogsTestManager,
    postsTestManager,
  };
};
