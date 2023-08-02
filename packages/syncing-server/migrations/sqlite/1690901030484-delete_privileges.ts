import { MigrationInterface, QueryRunner } from 'typeorm'

export class DeletePrivileges1690901030484 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const itemsWithPrivilegesContentTypeQueryResult = await queryRunner.manager.query(
      'SELECT COUNT(*) as count FROM items i WHERE i.content_type = "SN|Privileges"',
    )
    const itemsWithPrivilegesContentTypeCount = +itemsWithPrivilegesContentTypeQueryResult[0].count

    const batchSize = 1_000
    const batchCount = Math.ceil(itemsWithPrivilegesContentTypeCount / batchSize)

    for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
      await queryRunner.startTransaction()
      await queryRunner.manager.query(`DELETE FROM items WHERE content_type = "SN|Privileges" LIMIT ${batchSize}`)
      await queryRunner.commitTransaction()
    }
  }

  public async down(): Promise<void> {
    return
  }
}
