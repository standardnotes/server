import { MigrationInterface, QueryRunner } from 'typeorm'

export class fixAuthenticatorDataTypes1672232035280 implements MigrationInterface {
  name = 'fixAuthenticatorDataTypes1672232035280'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `authenticators` DROP COLUMN `created_at`')
    await queryRunner.query('ALTER TABLE `authenticators` ADD `created_at` datetime NOT NULL')
    await queryRunner.query('ALTER TABLE `authenticators` DROP COLUMN `updated_at`')
    await queryRunner.query('ALTER TABLE `authenticators` ADD `updated_at` datetime NOT NULL')
    await queryRunner.query('ALTER TABLE `authenticator_challenges` DROP COLUMN `created_at`')
    await queryRunner.query('ALTER TABLE `authenticator_challenges` ADD `created_at` datetime NOT NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `authenticator_challenges` DROP COLUMN `created_at`')
    await queryRunner.query('ALTER TABLE `authenticator_challenges` ADD `created_at` bigint NOT NULL')
    await queryRunner.query('ALTER TABLE `authenticators` DROP COLUMN `updated_at`')
    await queryRunner.query('ALTER TABLE `authenticators` ADD `updated_at` bigint NOT NULL')
    await queryRunner.query('ALTER TABLE `authenticators` DROP COLUMN `created_at`')
    await queryRunner.query('ALTER TABLE `authenticators` ADD `created_at` bigint NOT NULL')
  }
}
