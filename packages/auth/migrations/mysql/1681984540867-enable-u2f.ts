import { MigrationInterface, QueryRunner } from 'typeorm'

export class enableU2f1681984540867 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // add u2f permission for pro users
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "fb13e7d3-936f-4ded-a543-e1650cc99dfd")',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
