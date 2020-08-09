import {MigrationInterface, QueryRunner} from "typeorm";

export class createRanked1591038035160 implements MigrationInterface {
    name = 'createRanked1591038035160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "player_account_ranked" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tier" varchar NOT NULL, "division" varchar NOT NULL, "wins" integer NOT NULL, "losses" integer NOT NULL, "accountId" integer, CONSTRAINT "REL_dcee8f9cb5a0b1198945a958de" UNIQUE ("accountId"))`);
        await queryRunner.query(`CREATE TABLE "temporary_player_account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "region" varchar NOT NULL, "playerId" integer, CONSTRAINT "FK_24c30acc8eaa721f43d16f25c91" FOREIGN KEY ("playerId") REFERENCES "player" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_player_account"("id", "region", "playerId") SELECT "id", "region", "playerId" FROM "player_account"`);
        await queryRunner.query(`DROP TABLE "player_account"`);
        await queryRunner.query(`ALTER TABLE "temporary_player_account" RENAME TO "player_account"`);
        await queryRunner.query(`CREATE TABLE "temporary_player_account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "region" varchar NOT NULL, "playerId" integer, "name" varchar NOT NULL, "riotId" varchar NOT NULL, "lolId" varchar NOT NULL, CONSTRAINT "FK_24c30acc8eaa721f43d16f25c91" FOREIGN KEY ("playerId") REFERENCES "player" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_player_account"("id", "region", "playerId") SELECT "id", "region", "playerId" FROM "player_account"`);
        await queryRunner.query(`DROP TABLE "player_account"`);
        await queryRunner.query(`ALTER TABLE "temporary_player_account" RENAME TO "player_account"`);
        await queryRunner.query(`CREATE TABLE "temporary_player_account_ranked" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tier" varchar NOT NULL, "division" varchar NOT NULL, "wins" integer NOT NULL, "losses" integer NOT NULL, "accountId" integer, CONSTRAINT "REL_dcee8f9cb5a0b1198945a958de" UNIQUE ("accountId"), CONSTRAINT "FK_dcee8f9cb5a0b1198945a958de3" FOREIGN KEY ("accountId") REFERENCES "player_account" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_player_account_ranked"("id", "tier", "division", "wins", "losses", "accountId") SELECT "id", "tier", "division", "wins", "losses", "accountId" FROM "player_account_ranked"`);
        await queryRunner.query(`DROP TABLE "player_account_ranked"`);
        await queryRunner.query(`ALTER TABLE "temporary_player_account_ranked" RENAME TO "player_account_ranked"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_account_ranked" RENAME TO "temporary_player_account_ranked"`);
        await queryRunner.query(`CREATE TABLE "player_account_ranked" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tier" varchar NOT NULL, "division" varchar NOT NULL, "wins" integer NOT NULL, "losses" integer NOT NULL, "accountId" integer, CONSTRAINT "REL_dcee8f9cb5a0b1198945a958de" UNIQUE ("accountId"))`);
        await queryRunner.query(`INSERT INTO "player_account_ranked"("id", "tier", "division", "wins", "losses", "accountId") SELECT "id", "tier", "division", "wins", "losses", "accountId" FROM "temporary_player_account_ranked"`);
        await queryRunner.query(`DROP TABLE "temporary_player_account_ranked"`);
        await queryRunner.query(`ALTER TABLE "player_account" RENAME TO "temporary_player_account"`);
        await queryRunner.query(`CREATE TABLE "player_account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "region" varchar NOT NULL, "playerId" integer, CONSTRAINT "FK_24c30acc8eaa721f43d16f25c91" FOREIGN KEY ("playerId") REFERENCES "player" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "player_account"("id", "region", "playerId") SELECT "id", "region", "playerId" FROM "temporary_player_account"`);
        await queryRunner.query(`DROP TABLE "temporary_player_account"`);
        await queryRunner.query(`ALTER TABLE "player_account" RENAME TO "temporary_player_account"`);
        await queryRunner.query(`CREATE TABLE "player_account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accountId" varchar NOT NULL, "region" varchar NOT NULL, "playerId" integer, CONSTRAINT "FK_24c30acc8eaa721f43d16f25c91" FOREIGN KEY ("playerId") REFERENCES "player" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "player_account"("id", "region", "playerId") SELECT "id", "region", "playerId" FROM "temporary_player_account"`);
        await queryRunner.query(`DROP TABLE "temporary_player_account"`);
        await queryRunner.query(`DROP TABLE "player_account_ranked"`);
    }

}
