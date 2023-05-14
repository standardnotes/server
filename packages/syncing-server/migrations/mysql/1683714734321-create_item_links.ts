import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from 'typeorm'

export class CreateItemLink1683714734321 implements MigrationInterface {
  name = 'createItemLink1683714734321'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'item_links',
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
          name: 'item_uuid',
          type: 'varchar',
          length: '36',
          isNullable: false,
        }),
        new TableColumn({
          name: 'share_token',
          type: 'varchar',
          length: '255',
          isNullable: false,
        }),
        new TableColumn({
          name: 'content_type',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
        new TableColumn({
          name: 'encrypted_content_key',
          type: 'text',
          isNullable: true,
        }),
        new TableColumn({
          name: 'file_remote_identifier',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
        new TableColumn({
          name: 'duration',
          type: 'varchar',
          length: '255',
          isNullable: false,
        }),
        new TableColumn({
          name: 'consumed',
          type: 'tinyint',
          precision: 1,
          isNullable: true,
          default: 0,
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

    await queryRunner.createIndex(
      'item_links',
      new TableIndex({
        name: 'index_item_links_on_share_token',
        columnNames: ['share_token'],
        isUnique: true,
      }),
    )

    await queryRunner.createIndex(
      'item_links',
      new TableIndex({
        name: 'index_item_links_on_user_uuid',
        columnNames: ['user_uuid'],
      }),
    )

    await queryRunner.createIndex(
      'item_links',
      new TableIndex({
        name: 'index_item_links_on_item_uuid',
        columnNames: ['item_uuid'],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('item_links')
  }
}
