import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSessionVersion1707813542369 implements MigrationInterface {
  name = 'AddSessionVersion1707813542369'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `sessions` ADD `version` smallint NULL DEFAULT 1')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `sessions` DROP COLUMN `version`')
  }
}
