import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'

export class CreateRemoveSharedVaultUsers1685469710749 implements MigrationInterface {
  name = 'createRemoveSharedVaultUsers1685469710749'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'removed_shared_vault_users',
      columns: [
        new TableColumn({
          name: 'uuid',
          type: 'varchar',
          length: '36',
          isPrimary: true,
        }),
        new TableColumn({
          name: 'shared_vault_uuid',
          type: 'varchar',
          length: '36',
          isNullable: false,
        }),
        new TableColumn({
          name: 'user_uuid',
          type: 'varchar',
          length: '36',
          isNullable: false,
        }),
        new TableColumn({
          name: 'removed_by',
          type: 'varchar',
          length: '36',
          isNullable: false,
        }),
        new TableColumn({
          name: 'created_at_timestamp',
          type: 'bigint',
        }),
        new TableColumn({
          name: 'updated_at_timestamp',
          type: 'bigint',
        }),
      ],
    })

    await queryRunner.createTable(table)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('removed_shared_vault_users')
  }
}
