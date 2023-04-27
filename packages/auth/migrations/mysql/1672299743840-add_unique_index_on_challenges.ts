import { MigrationInterface, QueryRunner } from 'typeorm'

export class addUniqueIndexOnChallenges1672299743840 implements MigrationInterface {
  name = 'addUniqueIndexOnChallenges1672299743840'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `user_uuid_and_challenge` ON `authenticator_challenges`')
    await queryRunner.query('CREATE UNIQUE INDEX `unique_user_uuid` ON `authenticator_challenges` (`user_uuid`)')
    await queryRunner.query(
      'CREATE INDEX `user_uuid_and_challenge` ON `authenticator_challenges` (`user_uuid`, `challenge`)',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `user_uuid_and_challenge` ON `authenticator_challenges`')
    await queryRunner.query('DROP INDEX `unique_user_uuid` ON `authenticator_challenges`')
    await queryRunner.query(
      'CREATE INDEX `user_uuid_and_challenge` ON `authenticator_challenges` (`user_uuid`, `challenge`)',
    )
  }
}
