import { MigrationInterface, QueryRunner } from 'typeorm'

export class emergencyAccessInvitations1680597887475 implements MigrationInterface {
  name = 'emergencyAccessInvitations1680597887475'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `emergency_access_invitations` (`uuid` varchar(36) NOT NULL, `grantor_uuid` varchar(36) NOT NULL, `grantee_uuid` varchar(36) NOT NULL, `status` varchar(36) NOT NULL, `expires_at` datetime NOT NULL, `created_at` datetime NOT NULL, `updated_at` datetime NOT NULL, PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'ALTER TABLE `emergency_access_invitations` ADD CONSTRAINT `grantor_uuid_fk` FOREIGN KEY (`grantor_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE `emergency_access_invitations` ADD CONSTRAINT `grantee_uuid_fk` FOREIGN KEY (`grantee_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `emergency_access_invitations` DROP FOREIGN KEY `grantee_uuid_fk`')
    await queryRunner.query('ALTER TABLE `emergency_access_invitations` DROP FOREIGN KEY `grantor_uuid_fk`')
    await queryRunner.query('DROP TABLE `emergency_access_invitations`')
  }
}
