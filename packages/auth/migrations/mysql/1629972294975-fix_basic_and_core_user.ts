import { MigrationInterface, QueryRunner } from 'typeorm'

export class fixBasicAndCoreUser1629972294975 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE `roles` SET `name` = "CORE_USER" WHERE `name` = "BASIC_USER"')
    await queryRunner.query('UPDATE `roles` SET `name` = "BASIC_USER" WHERE `name` = "USER"')

    await queryRunner.query(
      'UPDATE `user_roles` SET `role_uuid` = "8802d6a3-b97c-4b25-968a-8fb21c65c3a1" WHERE `role_uuid` = "bde42e26-628c-44e6-9d76-21b08954b0bf"',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
