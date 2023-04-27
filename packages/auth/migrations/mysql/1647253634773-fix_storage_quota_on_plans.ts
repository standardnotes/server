import { MigrationInterface, QueryRunner } from 'typeorm'

export class fixStorageQuotaOnPlans1647253634773 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM `role_permissions` WHERE permission_uuid IN ("466da066-993a-4d34-b77c-786395fa285a", "6b195abd-fa3e-4743-ba10-8d50733d377c")',
    )

    await queryRunner.query(
      'UPDATE settings SET value = 0 WHERE name = "FILE_UPLOAD_BYTES_LIMIT" AND value = 5368709120',
    )

    await queryRunner.query(
      'UPDATE settings SET value = 5368709120 WHERE name = "FILE_UPLOAD_BYTES_LIMIT" AND value = 26843545600',
    )

    // Pro User Permissions - 25GB
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "6b195abd-fa3e-4743-ba10-8d50733d377c") \
    ',
    )

    // Plus User Permissions - 5GB
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ("dee6e144-724b-4450-86d1-cc784770b2e2", "466da066-993a-4d34-b77c-786395fa285a") \
    ',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
