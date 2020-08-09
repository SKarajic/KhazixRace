import {MigrationInterface, QueryRunner} from "typeorm";

export class addLeaguePoints1596882848131 implements MigrationInterface {
    name = 'addLeaguePoints1596882848131'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_player_account_ranked" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tier" varchar NOT NULL, "division" varchar NOT NULL, "wins" integer NOT NULL, "losses" integer NOT NULL, "accountId" integer, "points" integer NOT NULL, CONSTRAINT "UQ_dcee8f9cb5a0b1198945a958de3" UNIQUE ("accountId"), CONSTRAINT "FK_dcee8f9cb5a0b1198945a958de3" FOREIGN KEY ("accountId") REFERENCES "player_account" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_player_account_ranked"("id", "tier", "division", "wins", "losses", "accountId", "points") SELECT "id", "tier", "division", "wins", "losses", "accountId", 0 FROM "player_account_ranked"`);
        await queryRunner.query(`DROP TABLE "player_account_ranked"`);
        await queryRunner.query(`ALTER TABLE "temporary_player_account_ranked" RENAME TO "player_account_ranked"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_account_ranked" RENAME TO "temporary_player_account_ranked"`);
        await queryRunner.query(`CREATE TABLE "player_account_ranked" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tier" varchar NOT NULL, "division" varchar NOT NULL, "wins" integer NOT NULL, "losses" integer NOT NULL, "accountId" integer, CONSTRAINT "UQ_dcee8f9cb5a0b1198945a958de3" UNIQUE ("accountId"), CONSTRAINT "FK_dcee8f9cb5a0b1198945a958de3" FOREIGN KEY ("accountId") REFERENCES "player_account" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "player_account_ranked"("id", "tier", "division", "wins", "losses", "accountId") SELECT "id", "tier", "division", "wins", "losses", "accountId" FROM "temporary_player_account_ranked"`);
        await queryRunner.query(`DROP TABLE "temporary_player_account_ranked"`);
    }

}
