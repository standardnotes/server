import { MigrationInterface, QueryRunner } from 'typeorm'

export class dropUnusedIndexes1629964808297 implements MigrationInterface {
  name = 'dropUnusedIndexes1629964808297'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const indexItemsOnUserAndTimestamp = await queryRunner.manager.query(
      'SHOW INDEX FROM `items` where `key_name` = "index_items_on_user_uuid_and_updated_at_and_created_at"',
    )
    const indexItemsOnUserAndTimestampExists = indexItemsOnUserAndTimestamp && indexItemsOnUserAndTimestamp.length > 0
    if (indexItemsOnUserAndTimestampExists) {
      await queryRunner.query('ALTER TABLE `items` DROP INDEX index_items_on_user_uuid_and_updated_at_and_created_at')
    }

    const indexItemsOnUpdatedAt = await queryRunner.manager.query(
      'SHOW INDEX FROM `items` where `key_name` = "index_items_on_updated_at"',
    )
    const indexItemsOnUpdatedAtExists = indexItemsOnUpdatedAt && indexItemsOnUpdatedAt.length > 0
    if (indexItemsOnUpdatedAtExists) {
      await queryRunner.query('ALTER TABLE `items` DROP INDEX index_items_on_updated_at')
    }
  }

  public async down(): Promise<void> {
    return
  }
}
