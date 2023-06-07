import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'asymmetric_messages' })
export class AsymmetricMessage {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  declare userUuid: string

  @Column({
    name: 'sender_uuid',
  })
  declare senderUuid: string

  @Column({
    name: 'sender_public_key',
  })
  declare senderPublicKey: string

  @Column({
    name: 'encrypted_message',
  })
  declare encryptedMessage: string

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
