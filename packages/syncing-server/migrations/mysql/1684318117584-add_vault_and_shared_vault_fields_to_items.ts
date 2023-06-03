import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddVaultAndSharedVaultFieldsToItems1684318117584 implements MigrationInterface {
  name = 'addVaultAndSharedVaultFieldsToItems1684318117584'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'key_system_identifier',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    )
    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'shared_vault_uuid',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    )
    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'last_edited_by_uuid',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('items', 'shared_vault_uuid')
    await queryRunner.dropColumn('items', 'key_system_identifier')
    await queryRunner.dropColumn('items', 'last_edited_by_uuid')
  }
}
