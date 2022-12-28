import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'authenticator_challenges' })
@Index('user_uuid_and_challenge', ['userUuid', 'challenge'])
export class TypeORMAuthenticatorChallenge {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  declare userUuid: string

  @Column({
    name: 'challenge',
    type: 'varchar',
    length: 255,
  })
  declare challenge: Buffer

  @Column({
    name: 'created_at',
    type: 'bigint',
  })
  declare createdAt: number
}
