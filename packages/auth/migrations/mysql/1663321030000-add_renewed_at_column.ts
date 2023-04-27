import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRenewedAtColumn1663321030000 implements MigrationInterface {
  name = 'addRenewedAtColumn1663321030000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_subscriptions` ADD `renewed_at` bigint NULL')
  }

  public async down(): Promise<void> {
    return
  }
}
