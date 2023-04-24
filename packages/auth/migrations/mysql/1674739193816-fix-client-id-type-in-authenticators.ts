import { MigrationInterface, QueryRunner } from 'typeorm'

export class fixClientIdTypeInAuthenticators1674739193816 implements MigrationInterface {
  name = 'fixClientIdTypeInAuthenticators1674739193816'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `authenticators` DROP COLUMN `credential_id`')
    await queryRunner.query('ALTER TABLE `authenticators` ADD `credential_id` text NOT NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `authenticators` DROP COLUMN `credential_id`')
    await queryRunner.query('ALTER TABLE `authenticators` ADD `credential_id` varbinary(1024) NOT NULL')
  }
}
