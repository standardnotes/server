import { MigrationInterface, QueryRunner } from 'typeorm'

export class addSessionTracesCompoundIndex1671561748264 implements MigrationInterface {
  name = 'addSessionTracesCompoundIndex1671561748264'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE UNIQUE INDEX `user_uuid_and_creation_date` ON `session_traces` (`user_uuid`, `creation_date`)',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `user_uuid_and_creation_date` ON `session_traces`')
  }
}
