import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'

import { Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm'

import { MySQLOfflineUserSubscriptionRepository } from './MySQLOfflineUserSubscriptionRepository'
import { OfflineUserSubscription } from '../../Domain/Subscription/OfflineUserSubscription'

describe('MySQLOfflineUserSubscriptionRepository', () => {
  let selectQueryBuilder: SelectQueryBuilder<OfflineUserSubscription>
  let updateQueryBuilder: UpdateQueryBuilder<OfflineUserSubscription>
  let offlineSubscription: OfflineUserSubscription
  let ormRepository: Repository<OfflineUserSubscription>

  const createRepository = () => new MySQLOfflineUserSubscriptionRepository(ormRepository)

  beforeEach(() => {
    selectQueryBuilder = {} as jest.Mocked<SelectQueryBuilder<OfflineUserSubscription>>
    updateQueryBuilder = {} as jest.Mocked<UpdateQueryBuilder<OfflineUserSubscription>>

    offlineSubscription = {
      planName: SubscriptionName.ProPlan,
      cancelled: false,
      email: 'test@test.com',
    } as jest.Mocked<OfflineUserSubscription>

    ormRepository = {} as jest.Mocked<Repository<OfflineUserSubscription>>
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)
    ormRepository.save = jest.fn()
  })

  it('should save', async () => {
    await createRepository().save(offlineSubscription)

    expect(ormRepository.save).toHaveBeenCalledWith(offlineSubscription)
  })

  it('should find one longest lasting uncanceled subscription by user email if there are canceled ones', async () => {
    const canceledSubscription = {
      planName: SubscriptionName.ProPlan,
      cancelled: true,
      email: 'test@test.com',
    } as jest.Mocked<OfflineUserSubscription>

    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.orderBy = jest.fn().mockReturnThis()
    selectQueryBuilder.getMany = jest.fn().mockReturnValue([canceledSubscription, offlineSubscription])

    const result = await createRepository().findOneByEmail('test@test.com')

    expect(selectQueryBuilder.where).toHaveBeenCalledWith('email = :email', {
      email: 'test@test.com',
    })
    expect(selectQueryBuilder.orderBy).toHaveBeenCalledWith('ends_at', 'DESC')
    expect(selectQueryBuilder.getMany).toHaveBeenCalled()
    expect(result).toEqual(offlineSubscription)
  })

  it('should find one, longest lasting subscription by user email if there are no canceled ones', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.orderBy = jest.fn().mockReturnThis()
    selectQueryBuilder.getMany = jest.fn().mockReturnValue([offlineSubscription])

    const result = await createRepository().findOneByEmail('test@test.com')

    expect(selectQueryBuilder.where).toHaveBeenCalledWith('email = :email', {
      email: 'test@test.com',
    })
    expect(selectQueryBuilder.orderBy).toHaveBeenCalledWith('ends_at', 'DESC')
    expect(selectQueryBuilder.getMany).toHaveBeenCalled()
    expect(result).toEqual(offlineSubscription)
  })

  it('should find one, longest lasting subscription by user email if there are no ucanceled ones', async () => {
    offlineSubscription.cancelled = true

    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.orderBy = jest.fn().mockReturnThis()
    selectQueryBuilder.getMany = jest.fn().mockReturnValue([offlineSubscription])

    const result = await createRepository().findOneByEmail('test@test.com')

    expect(selectQueryBuilder.where).toHaveBeenCalledWith('email = :email', {
      email: 'test@test.com',
    })
    expect(selectQueryBuilder.orderBy).toHaveBeenCalledWith('ends_at', 'DESC')
    expect(selectQueryBuilder.getMany).toHaveBeenCalled()
    expect(result).toEqual(offlineSubscription)
  })

  it('should find none if there are no subscriptions for the user', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.orderBy = jest.fn().mockReturnThis()
    selectQueryBuilder.getMany = jest.fn().mockReturnValue([])

    const result = await createRepository().findOneByEmail('test@test.com')

    expect(selectQueryBuilder.where).toHaveBeenCalledWith('email = :email', {
      email: 'test@test.com',
    })
    expect(selectQueryBuilder.orderBy).toHaveBeenCalledWith('ends_at', 'DESC')
    expect(selectQueryBuilder.getMany).toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('should find multiple by user email active after', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.orderBy = jest.fn().mockReturnThis()
    selectQueryBuilder.getMany = jest.fn().mockReturnValue([offlineSubscription])

    const result = await createRepository().findByEmail('test@test.com', 123)

    expect(selectQueryBuilder.where).toHaveBeenCalledWith('email = :email AND ends_at > :endsAt', {
      email: 'test@test.com',
      endsAt: 123,
    })
    expect(selectQueryBuilder.orderBy).toHaveBeenCalledWith('ends_at', 'DESC')
    expect(selectQueryBuilder.getMany).toHaveBeenCalled()
    expect(result).toEqual([offlineSubscription])
  })

  it('should update cancelled by subscription id', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => updateQueryBuilder)

    updateQueryBuilder.update = jest.fn().mockReturnThis()
    updateQueryBuilder.set = jest.fn().mockReturnThis()
    updateQueryBuilder.where = jest.fn().mockReturnThis()
    updateQueryBuilder.execute = jest.fn()

    await createRepository().updateCancelled(1, true, 1000)

    expect(updateQueryBuilder.update).toHaveBeenCalled()
    expect(updateQueryBuilder.set).toHaveBeenCalledWith({
      updatedAt: expect.any(Number),
      cancelled: true,
    })
    expect(updateQueryBuilder.where).toHaveBeenCalledWith('subscription_id = :subscriptionId', {
      subscriptionId: 1,
    })
    expect(updateQueryBuilder.execute).toHaveBeenCalled()
  })

  it('should update ends at by subscription id', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => updateQueryBuilder)

    updateQueryBuilder.update = jest.fn().mockReturnThis()
    updateQueryBuilder.set = jest.fn().mockReturnThis()
    updateQueryBuilder.where = jest.fn().mockReturnThis()
    updateQueryBuilder.execute = jest.fn()

    await createRepository().updateEndsAt(1, 1000, 1000)

    expect(updateQueryBuilder.update).toHaveBeenCalled()
    expect(updateQueryBuilder.set).toHaveBeenCalledWith({
      updatedAt: expect.any(Number),
      endsAt: 1000,
    })
    expect(updateQueryBuilder.where).toHaveBeenCalledWith('subscription_id = :subscriptionId', {
      subscriptionId: 1,
    })
    expect(updateQueryBuilder.execute).toHaveBeenCalled()
  })

  it('should find one offline user subscription by user subscription id', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.getOne = jest.fn().mockReturnValue(offlineSubscription)

    const result = await createRepository().findOneBySubscriptionId(123)

    expect(selectQueryBuilder.where).toHaveBeenCalledWith('subscription_id = :subscriptionId', {
      subscriptionId: 123,
    })
    expect(selectQueryBuilder.getOne).toHaveBeenCalled()
    expect(result).toEqual(offlineSubscription)
  })
})
