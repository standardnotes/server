import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'

export class CreateVaultUser1684173023883 implements MigrationInterface {
  name = 'createVaultUser1684173023883'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'vault_users',
      columns: [
        new TableColumn({
          name: 'uuid',
          type: 'varchar',
          length: '36',
          isPrimary: true,
        }),
        new TableColumn({
          name: 'vault_uuid',
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
          name: 'permissions',
          type: 'varchar',
          length: '255',
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
    await queryRunner.dropTable('vault_users')
  }
}
