import { MigrationInterface, QueryRunner } from 'typeorm'

export class fixAuthenticatorIndexing1672232948685 implements MigrationInterface {
  name = 'fixAuthenticatorIndexing1672232948685'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `credential_id` ON `authenticators`')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE UNIQUE INDEX `credential_id` ON `authenticators` (`credential_id`)')
  }
}
