import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'authenticator_challenges' })
export class TypeORMAuthenticatorChallenge {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  @Index('unique_user_uuid', { unique: true })
  declare userUuid: string

  @Column({
    name: 'challenge',
    type: 'varchar',
    length: 255,
  })
  declare challenge: Buffer

  @Column({
    name: 'created_at',
    type: 'datetime',
  })
  declare createdAt: Date
}
