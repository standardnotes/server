import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeUserAgent1647421277767 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `updated_with_user_agent`')
  }

  public async down(): Promise<void> {
    return
  }
}
