import { MigrationInterface, QueryRunner } from 'typeorm'

export class addUniqueSettingIndex1625807999951 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_settings_on_name_and_user_uuid` ON `settings`')
    await queryRunner.query(
      'ALTER TABLE `settings` ADD UNIQUE INDEX `index_settings_on_name_and_user_uuid` (`name`, `user_uuid`)',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
