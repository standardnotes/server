import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'messages' })
export class TypeORMMessage {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'recipient_uuid',
    length: 36,
  })
  @Index('recipient_uuid_on_messages')
  declare recipientUuid: string

  @Column({
    name: 'sender_uuid',
    length: 36,
  })
  @Index('sender_uuid_on_messages')
  declare senderUuid: string

  @Column({
    name: 'encrypted_message',
    type: 'text',
  })
  declare encryptedMessage: string

  @Column({
    name: 'replaceability_identifier',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  declare replaceabilityIdentifier: string | null

  @Column({
    name: 'created_at_timestamp',
    type: 'bigint',
  })
  declare createdAtTimestamp: number

  @Column({
    name: 'updated_at_timestamp',
    type: 'bigint',
  })
  declare updatedAtTimestamp: number
}
