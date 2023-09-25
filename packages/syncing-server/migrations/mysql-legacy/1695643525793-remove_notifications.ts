import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveNotifications1695643525793 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM `notifications`')
  }

  public async down(): Promise<void> {
    return
  }
}
