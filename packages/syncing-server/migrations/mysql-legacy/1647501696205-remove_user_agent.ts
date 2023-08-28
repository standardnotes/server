import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeUserAgent1647501696205 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `items` DROP COLUMN `last_user_agent`')
  }

  public async down(): Promise<void> {
    return
  }
}
