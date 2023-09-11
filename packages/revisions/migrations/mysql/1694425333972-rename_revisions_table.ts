import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameRevisionsTable1694425333972 implements MigrationInterface {
  name = 'RenameRevisionsTable1694425333972'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('RENAME TABLE `revisions` TO `revisions_revisions`')
  }

  public async down(): Promise<void> {
    return
  }
}
