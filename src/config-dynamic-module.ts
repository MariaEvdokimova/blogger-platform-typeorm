import { ConfigModule } from "@nestjs/config";
import { envFilePaths } from "./env-file-paths";
import databaseConf from './core/db/db.config';

console.log('Loading env files from:', envFilePaths);


// must import this const in the head of your app.module.ts
export const configModule = ConfigModule.forRoot({
  isGlobal: true, //isGlobal делает модуль глобальным (автоматически регистрируется в каждый модуле)  
  envFilePath: envFilePaths,
  load: [databaseConf],
});
