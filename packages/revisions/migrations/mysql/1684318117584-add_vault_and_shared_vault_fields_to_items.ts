import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddVaultAndSharedVaultFieldsToRevisions1684318117584 implements MigrationInterface {
  name = 'addVaultAndSharedVaultFieldsToRevisions1684318117584'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'revisions',
      new TableColumn({
        name: 'key_system_identifier',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    )
    await queryRunner.addColumn(
      'revisions',
      new TableColumn({
        name: 'shared_vault_uuid',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('revisions', 'shared_vault_uuid')
    await queryRunner.dropColumn('revisions', 'key_system_identifier')
  }
}
