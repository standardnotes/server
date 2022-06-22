import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeBasicUserRole1652786070920 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE `roles` SET name = "CORE_USER", version = 3 WHERE name = "BASIC_USER"')
  }

  public async down(): Promise<void> {
    return
  }
}
