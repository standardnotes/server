import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameRevisionsTable1694425333972 implements MigrationInterface {
  name = 'RenameRevisionsTable1694425333972'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const revisionsTableExistsQueryResult = await queryRunner.manager.query(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = "revisions"',
    )
    const revisionsTableExists = revisionsTableExistsQueryResult[0].count === 1
    if (revisionsTableExists) {
      await queryRunner.query('ALTER TABLE `revisions` RENAME TO `revisions_revisions`, ALGORITHM=INSTANT')
    }
  }

  public async down(): Promise<void> {
    return
  }
}
