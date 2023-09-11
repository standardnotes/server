import { MigrationInterface, QueryRunner } from 'typeorm'

export class init1669113322388 implements MigrationInterface {
  name = 'init1669113322388'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.syncSchemaBetweenLegacyRevisions(queryRunner)

    await queryRunner.query(
      'CREATE TABLE `revisions_revisions` (`uuid` varchar(36) NOT NULL, `item_uuid` varchar(36) NOT NULL, `user_uuid` varchar(36) NULL, `content` mediumtext NULL, `content_type` varchar(255) NULL, `items_key_id` varchar(255) NULL, `enc_item_key` text NULL, `auth_hash` varchar(255) NULL, `creation_date` date NULL, `created_at` datetime(6) NULL, `updated_at` datetime(6) NULL, INDEX `item_uuid` (`item_uuid`), INDEX `user_uuid` (`user_uuid`), INDEX `creation_date` (`creation_date`), INDEX `created_at` (`created_at`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `created_at` ON `revisions_revisions`')
    await queryRunner.query('DROP INDEX `creation_date` ON `revisions_revisions`')
    await queryRunner.query('DROP INDEX `user_uuid` ON `revisions_revisions`')
    await queryRunner.query('DROP INDEX `item_uuid` ON `revisions_revisions`')
    await queryRunner.query('DROP TABLE `revisions_revisions`')
  }

  private async syncSchemaBetweenLegacyRevisions(queryRunner: QueryRunner): Promise<void> {
    const revisionsTableExistsQueryResult = await queryRunner.manager.query(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = "revisions"',
    )
    const revisionsTableExists = revisionsTableExistsQueryResult[0].count === 1
    if (!revisionsTableExists) {
      return
    }

    await queryRunner.query(
      'INSERT INTO `revisions_revisions`(`uuid`, `item_uuid`, `user_uuid`, `content`, `content_type`, `items_key_id`, `enc_item_key`, `auth_hash`, `creation_date`, `created_at`, `updated_at`) SELECT `uuid`, `item_uuid`, NULL, `content`, `content_type`, `items_key_id`, `enc_item_key`, `auth_hash`, `creation_date`, `created_at`, `updated_at` FROM `revisions`',
    )

    await queryRunner.query('DROP TABLE `revisions`')
  }
}
