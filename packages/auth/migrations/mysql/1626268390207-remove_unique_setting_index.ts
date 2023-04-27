import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeUniqueSettingIndex1626268390207 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_settings_on_name_and_user_uuid` ON `settings`')
    await queryRunner.query(
      'ALTER TABLE `settings` ADD INDEX `index_settings_on_name_and_user_uuid` (`name`, `user_uuid`)',
    )
    await queryRunner.query('ALTER TABLE `settings` ADD INDEX `index_settings_on_updated_at` (`updated_at`)')
  }

  public async down(): Promise<void> {
    return
  }
}
