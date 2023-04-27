import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRevokedSessions1610015065194 implements MigrationInterface {
  name = 'addRevokedSessions1610015065194'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE IF NOT EXISTS `revoked_sessions` (`uuid` varchar(36) NOT NULL, `user_uuid` varchar(36) NOT NULL, `received` tinyint(1) NOT NULL DEFAULT 0, `created_at` datetime NOT NULL, INDEX `index_revoked_sessions_on_user_uuid` (`user_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_revoked_sessions_on_user_uuid` ON `revoked_sessions`')
    await queryRunner.query('DROP TABLE `revoked_sessions`')
  }
}
