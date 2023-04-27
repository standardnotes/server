import { MigrationInterface, QueryRunner } from 'typeorm'

import { v4 } from 'uuid'

export class addRevisionForDuplicatedItems1631529502150 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const itemRevisions = await queryRunner.manager.query(
      'SELECT r.uuid as originalRevisionUuid, ir.item_uuid as properItemUuid, ir.uuid as relationUuid FROM revisions r INNER JOIN item_revisions ir ON ir.revision_uuid = r.uuid AND ir.item_uuid <> r.item_uuid',
    )

    for (const itemRevision of itemRevisions) {
      const revisionUuid = v4()

      await queryRunner.manager.query(
        `INSERT INTO revisions (uuid, item_uuid, content, content_type, items_key_id, enc_item_key, auth_hash, creation_date, created_at, updated_at) SELECT "${revisionUuid}", "${itemRevision['properItemUuid']}", content, content_type, items_key_id, enc_item_key, auth_hash, creation_date, created_at, updated_at FROM revisions WHERE uuid = "${itemRevision['originalRevisionUuid']}"`,
      )
      await queryRunner.manager.query(
        `UPDATE item_revisions SET revision_uuid = "${revisionUuid}" WHERE uuid = "${itemRevision['relationUuid']}"`,
      )
    }
  }

  public async down(): Promise<void> {
    return
  }
}
