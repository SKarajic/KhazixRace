import {MigrationInterface, QueryRunner} from "typeorm";

export class createPlayer1591010711714 implements MigrationInterface {
    name = 'createPlayer1591010711714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "player_stream" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "platform" varchar NOT NULL, "link" varchar NOT NULL, "playerId" integer)`);
        await queryRunner.query(`CREATE TABLE "player" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "player_account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accountId" varchar NOT NULL, "region" varchar NOT NULL, "playerId" integer)`);
        await queryRunner.query(`CREATE TABLE "temporary_player_stream" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "platform" varchar NOT NULL, "link" varchar NOT NULL, "playerId" integer, CONSTRAINT "FK_bf3bd246abe5873a036d4680540" FOREIGN KEY ("playerId") REFERENCES "player" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_player_stream"("id", "name", "platform", "link", "playerId") SELECT "id", "name", "platform", "link", "playerId" FROM "player_stream"`);
        await queryRunner.query(`DROP TABLE "player_stream"`);
        await queryRunner.query(`ALTER TABLE "temporary_player_stream" RENAME TO "player_stream"`);
        await queryRunner.query(`CREATE TABLE "temporary_player_account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accountId" varchar NOT NULL, "region" varchar NOT NULL, "playerId" integer, CONSTRAINT "FK_24c30acc8eaa721f43d16f25c91" FOREIGN KEY ("playerId") REFERENCES "player" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_player_account"("id", "accountId", "region", "playerId") SELECT "id", "accountId", "region", "playerId" FROM "player_account"`);
        await queryRunner.query(`DROP TABLE "player_account"`);
        await queryRunner.query(`ALTER TABLE "temporary_player_account" RENAME TO "player_account"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_account" RENAME TO "temporary_player_account"`);
        await queryRunner.query(`CREATE TABLE "player_account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accountId" varchar NOT NULL, "region" varchar NOT NULL, "playerId" integer)`);
        await queryRunner.query(`INSERT INTO "player_account"("id", "accountId", "region", "playerId") SELECT "id", "accountId", "region", "playerId" FROM "temporary_player_account"`);
        await queryRunner.query(`DROP TABLE "temporary_player_account"`);
        await queryRunner.query(`ALTER TABLE "player_stream" RENAME TO "temporary_player_stream"`);
        await queryRunner.query(`CREATE TABLE "player_stream" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "platform" varchar NOT NULL, "link" varchar NOT NULL, "playerId" integer)`);
        await queryRunner.query(`INSERT INTO "player_stream"("id", "name", "platform", "link", "playerId") SELECT "id", "name", "platform", "link", "playerId" FROM "temporary_player_stream"`);
        await queryRunner.query(`DROP TABLE "temporary_player_stream"`);
        await queryRunner.query(`DROP TABLE "player_account"`);
        await queryRunner.query(`DROP TABLE "player"`);
        await queryRunner.query(`DROP TABLE "player_stream"`);
    }

}
