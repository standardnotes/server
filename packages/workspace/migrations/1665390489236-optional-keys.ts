import { MigrationInterface, QueryRunner } from 'typeorm'

export class optionalKeys1665390489236 implements MigrationInterface {
  name = 'optionalKeys1665390489236'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `workspace_users` CHANGE `public_key` `public_key` varchar(255) NULL')
    await queryRunner.query(
      'ALTER TABLE `workspace_users` CHANGE `encrypted_private_key` `encrypted_private_key` varchar(255) NULL',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `workspace_users` CHANGE `encrypted_private_key` `encrypted_private_key` varchar(255) NOT NULL',
    )
    await queryRunner.query('ALTER TABLE `workspace_users` CHANGE `public_key` `public_key` varchar(255) NOT NULL')
  }
}
