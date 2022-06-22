import { MigrationInterface, QueryRunner } from 'typeorm'

export class changeSettingValueSize1625227894975 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `settings` CHANGE `value` `value` TEXT NOT NULL')
  }

  public async down(): Promise<void> {
    return
  }
}
