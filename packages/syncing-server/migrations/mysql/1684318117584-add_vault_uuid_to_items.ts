import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddVaultUuidToItems1684318117584 implements MigrationInterface {
  name = 'addVaultUuidToItems1684318117584'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'vault_uuid',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    )
    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'created_by_uuid',
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
    await queryRunner.dropColumn('items', 'vault_uuid')
    await queryRunner.dropColumn('items', 'last_edited_by_uuid')
  }
}
