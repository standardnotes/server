import { MigrationInterface, QueryRunner } from 'typeorm'

export class addInternalTeamUserRole1678266947362 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // remove beta files user role and permission
    await queryRunner.query('DELETE FROM `role_permissions` WHERE role_uuid="1cd9ee6e-bc95-4f32-957c-d8c41f94d4ef"')
    await queryRunner.query('DELETE FROM `user_roles` WHERE role_uuid="1cd9ee6e-bc95-4f32-957c-d8c41f94d4ef"')
    await queryRunner.query('DELETE FROM `roles` WHERE name="FILES_BETA_USER"')
    await queryRunner.query('DELETE FROM `permissions` WHERE name="app:files-beta"')

    // add internal team user role and permission
    await queryRunner.query(
      'INSERT INTO `roles` (uuid, name, version) VALUES ("9f8d2313-e8d0-48ad-b19c-026601d0ddf4", "INTERNAL_TEAM_USER", 1)',
    )
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("fb13e7d3-936f-4ded-a543-e1650cc99dfd", "server:universal-second-factor")',
    )
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("9f8d2313-e8d0-48ad-b19c-026601d0ddf4", "fb13e7d3-936f-4ded-a543-e1650cc99dfd")',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
