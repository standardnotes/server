import { MigrationInterface, QueryRunner } from 'typeorm'

export class addReadonlySessions1647862631224 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `sessions` ADD `readonly_access` tinyint(1) NOT NULL DEFAULT 0')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `sessions` DROP COLUMN `readonly_access`')
  }
}
