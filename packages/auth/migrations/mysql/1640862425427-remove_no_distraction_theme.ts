import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeNoDistractionTheme1640862425427 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM `permissions` WHERE `name` = "theme:no-distraction"')
  }

  public async down(): Promise<void> {
    return
  }
}
