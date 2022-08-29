import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from '../User/User'

@Entity({ name: 'revoked_sessions' })
export class RevokedSession {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  @Index('index_revoked_sessions_on_user_uuid')
  declare userUuid: string

  @Column({
    type: 'tinyint',
    width: 1,
    nullable: false,
    default: 0,
  })
  declare received: boolean

  @Column({
    name: 'created_at',
    type: 'datetime',
  })
  declare createdAt: Date

  @ManyToOne(
    /* istanbul ignore next */
    () => User,
    /* istanbul ignore next */
    (user) => user.revokedSessions,
    { onDelete: 'CASCADE', lazy: true, eager: false },
  )
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  declare user: Promise<User>

  @Column({
    name: 'received_at',
    type: 'datetime',
    nullable: true,
  })
  declare receivedAt: Date

  @Column({
    name: 'user_agent',
    type: 'text',
    nullable: true,
  })
  declare userAgent: string | null

  @Column({
    name: 'api_version',
    length: 255,
    nullable: true,
  })
  declare apiVersion: string
}
