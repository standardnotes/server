import { MigrationInterface, QueryRunner } from 'typeorm'

export class cleanupOrphanItemsAndRevisions1632219307742 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const usersTableExistsQueryResult = await queryRunner.manager.query(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = "users"',
    )
    const usersTableExists = usersTableExistsQueryResult[0].count === 1
    if (usersTableExists) {
      const orphanedItems = await queryRunner.manager.query(
        'SELECT i.uuid as uuid FROM items i LEFT JOIN users u ON i.user_uuid = u.uuid WHERE u.uuid IS NULL',
      )

      for (const orphanedItem of orphanedItems) {
        await queryRunner.manager.query(`DELETE FROM revisions WHERE item_uuid = "${orphanedItem['uuid']}"`)
        await queryRunner.manager.query(`DELETE FROM items WHERE uuid = "${orphanedItem['uuid']}"`)
      }
    }

    await queryRunner.manager.query('DELETE FROM items WHERE user_uuid IS NULL')

    const orphanedRevisions = await queryRunner.manager.query(
      'SELECT r.uuid as uuid FROM revisions r LEFT JOIN items i ON r.item_uuid = i.uuid WHERE i.uuid IS NULL',
    )

    for (const orphanedRevision of orphanedRevisions) {
      await queryRunner.manager.query(`DELETE FROM revisions WHERE uuid = "${orphanedRevision['uuid']}"`)
    }

    await queryRunner.manager.query('DELETE FROM revisions WHERE item_uuid IS NULL')
  }

  public async down(): Promise<void> {
    return
  }
}
