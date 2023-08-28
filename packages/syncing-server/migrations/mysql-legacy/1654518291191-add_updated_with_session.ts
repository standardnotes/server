import { MigrationInterface, QueryRunner } from 'typeorm'

export class addUpdatedWithSession1654518291191 implements MigrationInterface {
  name = 'addUpdatedWithSession1654518291191'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `items` ADD `updated_with_session` varchar(36) NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `items` DROP COLUMN `updated_with_session`')
  }
}
