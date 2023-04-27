import { MigrationInterface, QueryRunner } from 'typeorm'

export class addSharedSubscriptionInvitations1648458841415 implements MigrationInterface {
  name = 'addSharedSubscriptionInvitations1648458841415'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `shared_subscription_invitations` (`uuid` varchar(36) NOT NULL, `inviter_identifier` varchar(255) NOT NULL, `inviter_identifier_type` varchar(24) NOT NULL, `invitee_identifier` varchar(255) NOT NULL, `invitee_identifier_type` varchar(24) NOT NULL, `status` varchar(255) NOT NULL, `subscription_id` int(11) NOT NULL, `created_at` bigint NOT NULL, `updated_at` bigint NOT NULL, INDEX `inviter_identifier` (`inviter_identifier`), INDEX `invitee_identifier` (`invitee_identifier`), INDEX `invitee_and_status` (`invitee_identifier`, `status`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `invitee_and_status` ON `shared_subscription_invitations`')
    await queryRunner.query('DROP INDEX `invitee_identifier` ON `shared_subscription_invitations`')
    await queryRunner.query('DROP INDEX `inviter_identifier` ON `shared_subscription_invitations`')
    await queryRunner.query('DROP TABLE `shared_subscription_invitations`')
  }
}
