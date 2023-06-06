import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'

export class CreateContacts1684503299320 implements MigrationInterface {
  name = 'createContacts1684503299320'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'contacts',
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
          name: 'contact_uuid',
          type: 'varchar',
          length: '36',
          isNullable: false,
        }),
        new TableColumn({
          name: 'contact_public_key',
          type: 'varchar',
          length: '255',
          isNullable: false,
        }),
        new TableColumn({
          name: 'contact_signing_public_key',
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
    await queryRunner.dropTable('contacts')
  }
}
