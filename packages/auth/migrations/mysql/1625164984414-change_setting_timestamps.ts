import { MigrationInterface, QueryRunner } from 'typeorm'

export class changeSettingTimestamps1625164984414 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `settings` CHANGE `created_at` `created_at` BIGINT NOT NULL')
    await queryRunner.query('ALTER TABLE `settings` CHANGE `updated_at` `updated_at` BIGINT NOT NULL')
  }

  public async down(): Promise<void> {
    return
  }
}
