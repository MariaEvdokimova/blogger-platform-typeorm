import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeRelationLikesPostAndCommentsUserManyToOne1761320326563 implements MigrationInterface {
    name = 'ChangeRelationLikesPostAndCommentsUserManyToOne1761320326563'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "commentLikes" DROP CONSTRAINT "FK_6033b505c173866759868b4445c"`);
        await queryRunner.query(`ALTER TABLE "commentLikes" DROP CONSTRAINT "REL_6033b505c173866759868b4445"`);
        await queryRunner.query(`ALTER TABLE "postLikes" DROP CONSTRAINT "FK_d3a2b7367faf9b6bcf2428a2883"`);
        await queryRunner.query(`ALTER TABLE "postLikes" DROP CONSTRAINT "REL_d3a2b7367faf9b6bcf2428a288"`);
        await queryRunner.query(`ALTER TABLE "commentLikes" ADD CONSTRAINT "FK_6033b505c173866759868b4445c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "postLikes" ADD CONSTRAINT "FK_d3a2b7367faf9b6bcf2428a2883" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "postLikes" DROP CONSTRAINT "FK_d3a2b7367faf9b6bcf2428a2883"`);
        await queryRunner.query(`ALTER TABLE "commentLikes" DROP CONSTRAINT "FK_6033b505c173866759868b4445c"`);
        await queryRunner.query(`ALTER TABLE "postLikes" ADD CONSTRAINT "REL_d3a2b7367faf9b6bcf2428a288" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "postLikes" ADD CONSTRAINT "FK_d3a2b7367faf9b6bcf2428a2883" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "commentLikes" ADD CONSTRAINT "REL_6033b505c173866759868b4445" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "commentLikes" ADD CONSTRAINT "FK_6033b505c173866759868b4445c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
