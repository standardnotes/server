import { MigrationInterface, QueryRunner } from 'typeorm'

export class revokedSessionData1661771230400 implements MigrationInterface {
  name = 'revokedSessionData1661771230400'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revoked_sessions` ADD `received_at` datetime NULL')
    await queryRunner.query('ALTER TABLE `revoked_sessions` ADD `user_agent` text NULL')
    await queryRunner.query('ALTER TABLE `revoked_sessions` ADD `api_version` varchar(255) NULL')
  }

  public async down(): Promise<void> {
    return
  }
}
