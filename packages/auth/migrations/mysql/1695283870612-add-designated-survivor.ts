import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDesignatedSurvivor1695283870612 implements MigrationInterface {
  name = 'AddDesignatedSurvivor1695283870612'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `auth_shared_vault_users` ADD `is_designated_survivor` tinyint NOT NULL DEFAULT 0',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `auth_shared_vault_users` DROP COLUMN `is_designated_survivor`')
  }
}
