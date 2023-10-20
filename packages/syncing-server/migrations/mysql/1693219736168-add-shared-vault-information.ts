import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSharedVaultInformation1693219736168 implements MigrationInterface {
  name = 'AddSharedVaultInformation1693219736168'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `items` ADD `last_edited_by` varchar(36) NULL, ALGORITHM = INSTANT')
    await queryRunner.query('ALTER TABLE `items` ADD `shared_vault_uuid` varchar(36) NULL, ALGORITHM = INSTANT')
    await queryRunner.query('ALTER TABLE `items` ADD `key_system_identifier` varchar(36) NULL, ALGORITHM = INSTANT')
    await queryRunner.query('CREATE INDEX `index_items_on_shared_vault_uuid` ON `items` (`shared_vault_uuid`)')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_items_on_shared_vault_uuid` ON `items`')
    await queryRunner.query('ALTER TABLE `items` DROP COLUMN `key_system_identifier`, ALGORITHM = INSTANT')
    await queryRunner.query('ALTER TABLE `items` DROP COLUMN `shared_vault_uuid`, ALGORITHM = INSTANT')
    await queryRunner.query('ALTER TABLE `items` DROP COLUMN `last_edited_by`, ALGORITHM = INSTANT')
  }
}
