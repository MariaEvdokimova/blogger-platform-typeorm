import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSecurityDevice1761249790315 implements MigrationInterface {
    name = 'CreateSecurityDevice1761249790315'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "securityDevice" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "deviceName" character varying NOT NULL, "deviceId" uuid NOT NULL, "ip" character varying NOT NULL, "iat" TIMESTAMP, "exp" TIMESTAMP, "userId" integer NOT NULL, CONSTRAINT "PK_834ae91ac973f194377f6583f8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "securityDevice" ADD CONSTRAINT "FK_776729134ef37a41c4384da96b8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "securityDevice" DROP CONSTRAINT "FK_776729134ef37a41c4384da96b8"`);
        await queryRunner.query(`DROP TABLE "securityDevice"`);
    }

}
