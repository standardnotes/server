import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSessionPrivateIdentifier1709133001993 implements MigrationInterface {
  name = 'AddSessionPrivateIdentifier1709133001993'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `sessions` ADD `private_identifier` varchar(36) NULL COMMENT 'Used to identify a session without exposing the UUID in client-side cookies.'",
    )
    await queryRunner.query('CREATE INDEX `index_sessions_on_private_identifier` ON `sessions` (`private_identifier`)')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_sessions_on_private_identifier` ON `sessions`')
    await queryRunner.query('ALTER TABLE `sessions` DROP COLUMN `private_identifier`')
  }
}
