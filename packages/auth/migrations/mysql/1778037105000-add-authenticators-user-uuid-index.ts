import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAuthenticatorsUserUuidIndex1778037105000 implements MigrationInterface {
  name = 'AddAuthenticatorsUserUuidIndex1778037105000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE INDEX `index_authenticators_on_user_uuid` ON `authenticators` (`user_uuid`)')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_authenticators_on_user_uuid` ON `authenticators`')
  }
}
