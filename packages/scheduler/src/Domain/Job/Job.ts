/* istanbul ignore file */
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Predicate } from '../Predicate/Predicate'
import { JobName } from './JobName'
import { JobStatus } from './JobStatus'

@Entity({ name: 'jobs' })
@Index('index_on_scheduled_status', ['status', 'scheduledAt'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    type: 'varchar',
    length: 255,
  })
  declare name: JobName

  @Column({
    name: 'user_identifier',
    length: 255,
  })
  @Index('index_jobs_on_user_identifier')
  declare userIdentifier: string

  @Column({
    type: 'varchar',
    name: 'user_identifier_type',
    length: 32,
  })
  declare userIdentifierType: 'email' | 'uuid'

  @Column({
    type: 'varchar',
    length: 32,
  })
  declare status: JobStatus

  @Column({
    name: 'created_at',
    type: 'bigint',
  })
  declare createdAt: number

  @Column({
    name: 'scheduled_at',
    type: 'bigint',
  })
  declare scheduledAt: number

  @OneToMany(
    /* istanbul ignore next */
    () => Predicate,
    /* istanbul ignore next */
    (predicate) => predicate.job,
    /* istanbul ignore next */
    { lazy: true, eager: false },
  )
  declare predicates: Promise<Predicate[]>
}
