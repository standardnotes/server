import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'

export class CreateAsymmetricMessages1686568012955 implements MigrationInterface {
  name = 'createAsymmetricMessages1686568012955'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'asymmetric_messages',
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
          name: 'sender_uuid',
          type: 'varchar',
          length: '255',
          isNullable: false,
        }),
        new TableColumn({
          name: 'encrypted_message',
          type: 'text',
          isNullable: false,
        }),
        new TableColumn({
          name: 'replaceability_identifier',
          type: 'varchar',
          length: '255',
          isNullable: true,
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
    await queryRunner.dropTable('asymmetric_messages')
  }
}
