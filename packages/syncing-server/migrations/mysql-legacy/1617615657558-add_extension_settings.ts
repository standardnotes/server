import { MigrationInterface, QueryRunner } from 'typeorm'

export class addExtensionSettings1617615657558 implements MigrationInterface {
  name = 'addExtensionSettings1617615657558'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE IF NOT EXISTS `extension_settings` (`uuid` varchar(36) NOT NULL, `extension_id` varchar(255) NULL, `mute_emails` tinyint(1) NULL DEFAULT 0, `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX `index_extension_settings_on_extension_id` (`extension_id`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return
  }
}
