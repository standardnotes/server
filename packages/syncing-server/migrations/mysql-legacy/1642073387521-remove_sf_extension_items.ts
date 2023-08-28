import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeSfExtensionItems1642073387521 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query('DELETE FROM items WHERE content_type = "SF|Extension"')
  }

  public async down(): Promise<void> {
    return
  }
}
