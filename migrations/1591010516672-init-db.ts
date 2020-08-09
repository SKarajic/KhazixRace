import {MigrationInterface, QueryRunner} from "typeorm";

export class initDb1591010516672 implements MigrationInterface {
    name = 'initDb1591010516672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`PRAGMA foreign_keys=ON`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`PRAGMA foreign_keys=OFF`);
    }

}
