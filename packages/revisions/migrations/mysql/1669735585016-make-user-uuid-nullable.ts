import { MigrationInterface, QueryRunner } from 'typeorm'

export class makeUserUuidNullable1669735585016 implements MigrationInterface {
  name = 'makeUserUuidNullable1669735585016'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.renameRevisionsTable(queryRunner)

    await queryRunner.query('ALTER TABLE `revisions_revisions` CHANGE `user_uuid` `user_uuid` varchar(36) NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revisions_revisions` CHANGE `user_uuid` `user_uuid` varchar(36) NOT NULL')
  }

  private async renameRevisionsTable(queryRunner: QueryRunner) {
    const revisionsTableExistsQueryResult = await queryRunner.manager.query(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = "revisions"',
    )
    const revisionsTableExists = revisionsTableExistsQueryResult[0].count === 1
    if (revisionsTableExists) {
      await queryRunner.query('ALTER TABLE `revisions` RENAME TO `revisions_revisions`, ALGORITHM=INSTANT')
    }
  }
}
