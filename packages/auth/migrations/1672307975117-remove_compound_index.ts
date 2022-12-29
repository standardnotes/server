import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeCompoundIndex1672307975117 implements MigrationInterface {
  name = 'removeCompoundIndex1672307975117'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `user_uuid_and_challenge` ON `authenticator_challenges`')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX `user_uuid_and_challenge` ON `authenticator_challenges` (`user_uuid`, `challenge`)',
    )
  }
}
