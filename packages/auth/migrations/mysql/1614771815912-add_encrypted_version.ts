import { MigrationInterface, QueryRunner } from 'typeorm'

export class addEncryptedVersion1614771815912 implements MigrationInterface {
  name = 'addEncryptedVersion1614771815912'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `settings` CHANGE `encrypted` `server_encryption_version` tinyint(1) NOT NULL DEFAULT 0',
    )
    await queryRunner.query('ALTER TABLE `users` ADD `encrypted_server_key` varchar(255) NULL')
    await queryRunner.query(
      'ALTER TABLE `settings` CHANGE `server_encryption_version` `server_encryption_version` tinyint NOT NULL DEFAULT 0',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `settings` CHANGE `server_encryption_version` `server_encryption_version` tinyint(1) NOT NULL DEFAULT 0',
    )
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `encrypted_server_key`')
    await queryRunner.query(
      'ALTER TABLE `settings` CHANGE `server_encryption_version` `encrypted` tinyint(1) NOT NULL DEFAULT 0',
    )
  }
}
