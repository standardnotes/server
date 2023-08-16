import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveRevisionsForeignKey1692176803410 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const revisionsTableExistsQueryResult = await queryRunner.manager.query(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = "revisions"',
    )
    const revisionsTableExists = revisionsTableExistsQueryResult[0].count === 1
    if (revisionsTableExists) {
      try {
        await queryRunner.query('ALTER TABLE `revisions` DROP FOREIGN KEY `FK_ab3b92e54701fe3010022a31d90`')
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error dropping foreign key: ', (error as Error).message)
      }
    }
  }

  public async down(): Promise<void> {
    return
  }
}
