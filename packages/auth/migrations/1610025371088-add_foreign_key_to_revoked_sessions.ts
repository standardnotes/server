import { MigrationInterface, QueryRunner } from 'typeorm'

export class addForeignKeyToRevokedSessions1610025371088 implements MigrationInterface {
  name = 'addForeignKeyToRevokedSessions1610025371088'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `revoked_sessions` ADD CONSTRAINT `FK_b357d1397b82bcda5e6cc9b0062` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revoked_sessions` DROP FOREIGN KEY `FK_b357d1397b82bcda5e6cc9b0062`')
  }
}
