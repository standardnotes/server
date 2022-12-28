import { MigrationInterface, QueryRunner } from 'typeorm'

export class addAuthenticatorChallenges1672227471677 implements MigrationInterface {
  name = 'addAuthenticatorChallenges1672227471677'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `authenticator_challenges` (`uuid` varchar(36) NOT NULL, `user_uuid` varchar(36) NOT NULL, `challenge` varchar(255) NOT NULL, `created_at` bigint NOT NULL, INDEX `user_uuid_and_challenge` (`user_uuid`, `challenge`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `user_uuid_and_challenge` ON `authenticator_challenges`')
    await queryRunner.query('DROP TABLE `authenticator_challenges`')
  }
}
