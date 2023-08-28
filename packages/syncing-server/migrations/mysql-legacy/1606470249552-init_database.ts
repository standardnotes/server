import { MigrationInterface, QueryRunner } from 'typeorm'

export class initDatabase1606470249552 implements MigrationInterface {
  name = 'initDatabase1606470249552'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.fixUpdatedAtTimestampsFromLegacyMigration(queryRunner)

    await queryRunner.query(
      'CREATE TABLE IF NOT EXISTS `items` (`uuid` varchar(36) NOT NULL, `duplicate_of` varchar(36) NULL, `items_key_id` varchar(255) NULL, `content` mediumtext NULL, `content_type` varchar(255) NULL, `enc_item_key` text NULL, `auth_hash` varchar(255) NULL, `user_uuid` varchar(36) NULL, `deleted` tinyint(1) NULL DEFAULT 0, `last_user_agent` text NULL, `created_at` datetime(6) NOT NULL, `updated_at` datetime(6) NOT NULL, `created_at_timestamp` BIGINT NOT NULL, `updated_at_timestamp` BIGINT NOT NULL, INDEX `index_items_on_content_type` (`content_type`), INDEX `index_items_on_user_uuid` (`user_uuid`), INDEX `index_items_on_deleted` (`deleted`), INDEX `updated_at_timestamp` (`updated_at_timestamp`), INDEX `index_items_on_updated_at` (`updated_at`), INDEX `user_uuid_and_updated_at_timestamp_and_created_at_timestamp` (`user_uuid`, `updated_at_timestamp`, `created_at_timestamp`), INDEX `index_items_on_user_uuid_and_updated_at_and_created_at` (`user_uuid`, `updated_at`, `created_at`), INDEX `index_items_on_user_uuid_and_content_type` (`user_uuid`, `content_type`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'CREATE TABLE IF NOT EXISTS `revisions` (`uuid` varchar(36) NOT NULL, `item_uuid` varchar(36) NULL, `content` mediumtext NULL, `content_type` varchar(255) NULL, `items_key_id` varchar(255) NULL, `enc_item_key` text NULL, `auth_hash` varchar(255) NULL, `creation_date` date NULL, `created_at` datetime(6) NULL, `updated_at` datetime(6) NULL, INDEX `index_revisions_on_item_uuid` (`item_uuid`), INDEX `index_revisions_on_creation_date` (`creation_date`), INDEX `index_revisions_on_created_at` (`created_at`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'CREATE TABLE IF NOT EXISTS `item_revisions` (`uuid` varchar(36) NOT NULL, `item_uuid` varchar(36) NOT NULL, `revision_uuid` varchar(36) NOT NULL, INDEX `index_item_revisions_on_item_uuid` (`item_uuid`), INDEX `index_item_revisions_on_revision_uuid` (`revision_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return
  }

  private async fixUpdatedAtTimestampsFromLegacyMigration(queryRunner: QueryRunner): Promise<void> {
    const itemsTableExistsQueryResult = await queryRunner.manager.query(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = "items"',
    )
    const itemsTableExists = itemsTableExistsQueryResult[0].count === 1
    if (!itemsTableExists) {
      return
    }

    const updatedAtTimestampColumnExistsQueryResult = await queryRunner.manager.query(
      'SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = "items" AND column_name = "updated_at_timestamp"',
    )
    const updatedAtTimestampColumnExists = updatedAtTimestampColumnExistsQueryResult[0].count === 1
    if (updatedAtTimestampColumnExists) {
      return
    }

    await queryRunner.query('ALTER TABLE `items` ADD COLUMN `updated_at_timestamp` BIGINT NOT NULL')
    await queryRunner.query('ALTER TABLE `items` ADD COLUMN `created_at_timestamp` BIGINT NOT NULL')
    await queryRunner.query(
      'ALTER TABLE `items` ADD INDEX `user_uuid_and_updated_at_timestamp_and_created_at_timestamp` (`user_uuid`, `updated_at_timestamp`, `created_at_timestamp`)',
    )
    await queryRunner.query('ALTER TABLE `items` ADD INDEX `updated_at_timestamp` (`updated_at_timestamp`)')
    await queryRunner.query('UPDATE `items` SET `created_at_timestamp` = UNIX_TIMESTAMP(`created_at`) * 1000000')
    await queryRunner.query('UPDATE `items` SET `updated_at_timestamp` = UNIX_TIMESTAMP(`updated_at`) * 1000000')
  }
}
