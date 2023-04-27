import { MigrationInterface, QueryRunner } from 'typeorm'

export class addSubscriptionSharingPermission1663073954000 implements MigrationInterface {
  name = 'addSubscriptionSharingPermission1663073954000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("3aeaf12e-380f-4f21-97b9-d862d63874f6", "server:subscription-sharing")',
    )

    // Pro User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "3aeaf12e-380f-4f21-97b9-d862d63874f6") \
    ',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
