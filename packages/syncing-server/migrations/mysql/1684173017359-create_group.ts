import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'

export class CreateGroup1684173017359 implements MigrationInterface {
  name = 'createGroup1684173017359'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'groups',
      columns: [
        new TableColumn({
          name: 'uuid',
          type: 'varchar',
          length: '36',
          isPrimary: true,
        }),
        new TableColumn({
          name: 'user_uuid',
          type: 'varchar',
          length: '36',
          isNullable: false,
        }),
        new TableColumn({
          name: 'vault_system_identifier',
          type: 'varchar',
          length: '36',
          isNullable: false,
        }),
        new TableColumn({
          name: 'specified_items_key_uuid',
          type: 'varchar',
          length: '36',
          isNullable: false,
        }),
        new TableColumn({
          name: 'file_upload_bytes_used',
          type: 'bigint',
        }),
        new TableColumn({
          name: 'file_upload_bytes_limit',
          type: 'bigint',
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
    await queryRunner.dropTable('groups')
  }
}
