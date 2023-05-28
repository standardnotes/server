import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeVaults1665047863774 implements MigrationInterface {
  name = 'removeVaults1665047863774'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `group_users` DROP FOREIGN KEY `FK_9d1bcb8c649eb05d7a2eb62114e`')
    await queryRunner.query('ALTER TABLE `group_users` DROP FOREIGN KEY `FK_b97989611efde2c54b074127920`')
    await queryRunner.query('DROP INDEX `index_group_users_on_group_and_user` ON `group_users`')
    await queryRunner.query('DROP TABLE `group_users`')
    await queryRunner.query('DROP TABLE `groups`')
  }

  public async down(): Promise<void> {
    return
  }
}
