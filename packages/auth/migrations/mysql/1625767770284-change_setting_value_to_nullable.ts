import { MigrationInterface, QueryRunner } from 'typeorm'

export class changeSettingValueToNullable1625767770284 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `settings` CHANGE `value` `value` TEXT')
  }

  public async down(): Promise<void> {
    return
  }
}
