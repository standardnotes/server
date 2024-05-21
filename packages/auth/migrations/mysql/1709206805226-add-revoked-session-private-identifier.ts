import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddRevokedSessionPrivateIdentifier1709206805226 implements MigrationInterface {
  name = 'AddRevokedSessionPrivateIdentifier1709206805226'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `revoked_sessions` ADD `private_identifier` varchar(36) NULL COMMENT 'Used to identify a session without exposing the UUID in client-side cookies.'",
    )
    await queryRunner.query(
      'CREATE INDEX `index_revoked_sessions_on_private_identifier` ON `revoked_sessions` (`private_identifier`)',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_revoked_sessions_on_private_identifier` ON `revoked_sessions`')
    await queryRunner.query('ALTER TABLE `revoked_sessions` DROP COLUMN `private_identifier`')
  }
}
