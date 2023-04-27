import { MigrationInterface, QueryRunner } from 'typeorm'

export class remove2faManager1651064332146 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM `permissions` WHERE name="component:2fa-manager"')
  }

  public async down(): Promise<void> {
    return
  }
}
