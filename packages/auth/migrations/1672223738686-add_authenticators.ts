import { MigrationInterface, QueryRunner } from 'typeorm'

export class addAuthenticators1672223738686 implements MigrationInterface {
  name = 'addAuthenticators1672223738686'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `authenticators` (`uuid` varchar(36) NOT NULL, `user_uuid` varchar(36) NOT NULL, `credential_id` varbinary(1024) NOT NULL, `credential_public_key` blob NOT NULL, `counter` bigint NOT NULL, `credential_device_type` varchar(32) NOT NULL, `credential_backed_up` tinyint NOT NULL, `transports` varchar(255) NULL, `created_at` bigint NOT NULL, `updated_at` bigint NOT NULL, UNIQUE INDEX `credential_id` (`credential_id`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `credential_id` ON `authenticators`')
    await queryRunner.query('DROP TABLE `authenticators`')
  }
}
