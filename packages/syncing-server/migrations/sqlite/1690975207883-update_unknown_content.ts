import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateUnknownContent1690975207883 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query('UPDATE items SET content_type = "Note" WHERE content_type = "Unknown"')
  }

  public async down(): Promise<void> {
    return
  }
}
