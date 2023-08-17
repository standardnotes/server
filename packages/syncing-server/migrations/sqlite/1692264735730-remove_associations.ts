import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveAssociations1692264735730 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "key_system_identifier_on_key_system_associations"')
    await queryRunner.query('DROP INDEX "item_uuid_on_key_system_associations"')
    await queryRunner.query('DROP TABLE "key_system_associations"')

    await queryRunner.query('DROP INDEX "item_uuid_on_shared_vault_associations"')
    await queryRunner.query('DROP INDEX "shared_vault_uuid_on_shared_vault_associations"')
    await queryRunner.query('DROP TABLE "shared_vault_associations"')
  }

  public async down(): Promise<void> {
    return
  }
}
