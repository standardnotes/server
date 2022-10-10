import { MigrationInterface, QueryRunner } from 'typeorm'

export class renamePrivateKey1665389240189 implements MigrationInterface {
  name = 'renamePrivateKey1665389240189'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `workspace_users` CHANGE `private_key` `encrypted_private_key` varchar(255) NOT NULL',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `workspace_users` CHANGE `encrypted_private_key` `private_key` varchar(255) NOT NULL',
    )
  }
}
