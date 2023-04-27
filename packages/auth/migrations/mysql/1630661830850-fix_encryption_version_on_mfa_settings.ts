import { MigrationInterface, QueryRunner } from 'typeorm'

export class fixEncryptionVersionOnMfaSettings1630661830850 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE `settings` SET `server_encryption_version` = 1 WHERE `server_encryption_version` = 2',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
