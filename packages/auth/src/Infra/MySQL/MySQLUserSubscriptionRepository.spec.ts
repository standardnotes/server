import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'

import { Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm'
import { UserSubscription } from '../../Domain/Subscription/UserSubscription'

import { MySQLUserSubscriptionRepository } from './MySQLUserSubscriptionRepository'
import { UserSubscriptionType } from '../../Domain/Subscription/UserSubscriptionType'

describe('MySQLUserSubscriptionRepository', () => {
  let ormRepository: Repository<UserSubscription>
  let selectQueryBuilder: SelectQueryBuilder<UserSubscription>
  let updateQueryBuilder: UpdateQueryBuilder<UserSubscription>
  let subscription: UserSubscription

  const createRepository = () => new MySQLUserSubscriptionRepository(ormRepository)

  beforeEach(() => {
    selectQueryBuilder = {} as jest.Mocked<SelectQueryBuilder<UserSubscription>>
    updateQueryBuilder = {} as jest.Mocked<UpdateQueryBuilder<UserSubscription>>

    subscription = {
      planName: SubscriptionName.ProPlan,
      cancelled: false,
    } as jest.Mocked<UserSubscription>

    ormRepository = {} as jest.Mocked<Repository<UserSubscription>>
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)
    ormRepository.save = jest.fn()
  })

  it('should save', async () => {
    await createRepository().save(subscription)

    expect(ormRepository.save).toHaveBeenCalledWith(subscription)
  })

  it('should find one longest lasting uncanceled subscription by user uuid if there are canceled ones', async () => {
    const canceledSubscription = {
      planName: SubscriptionName.ProPlan,
      cancelled: true,
    } as jest.Mocked<UserSubscription>

    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.orderBy = jest.fn().mockReturnThis()
    selectQueryBuilder.getMany = jest.fn().mockReturnValue([canceledSubscription, subscription])

    const result = await createRepository().findOneByUserUuid('123')

    expect(selectQueryBuilder.where).toHaveBeenCalledWith('user_uuid = :user_uuid', {
      user_uuid: '123',
    })
    expect(selectQueryBuilder.orderBy).toHaveBeenCalledWith('ends_at', 'DESC')
    expect(selectQueryBuilder.getMany).toHaveBeenCalled()
    expect(result).toEqual(subscription)
  })

  it('should find one, longest lasting subscription by user uuid if there are no canceled ones', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.orderBy = jest.fn().mockReturnThis()
    selectQueryBuilder.getMany = jest.fn().mockReturnValue([subscription])

    const result = await createRepository().findOneByUserUuid('123')

    expect(selectQueryBuilder.where).toHaveBeenCalledWith('user_uuid = :user_uuid', {
      user_uuid: '123',
    })
    expect(selectQueryBuilder.orderBy).toHaveBeenCalledWith('ends_at', 'DESC')
    expect(selectQueryBuilder.getMany).toHaveBeenCalled()
    expect(result).toEqual(subscription)
  })

  it('should find one, longest lasting subscription by user uuid if there are no ucanceled ones', async () => {
    subscription.cancelled = true

    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.orderBy = jest.fn().mockReturnThis()
    selectQueryBuilder.getMany = jest.fn().mockReturnValue([subscription])

    const result = await createRepository().findOneByUserUuid('123')

    expect(selectQueryBuilder.where).toHaveBeenCalledWith('user_uuid = :user_uuid', {
      user_uuid: '123',
    })
    expect(selectQueryBuilder.orderBy).toHaveBeenCalledWith('ends_at', 'DESC')
    expect(selectQueryBuilder.getMany).toHaveBeenCalled()
    expect(result).toEqual(subscription)
  })

  it('should find none if there are no subscriptions for the user', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.orderBy = jest.fn().mockReturnThis()
    selectQueryBuilder.getMany = jest.fn().mockReturnValue([])

    const result = await createRepository().findOneByUserUuid('123')

    expect(selectQueryBuilder.where).toHaveBeenCalledWith('user_uuid = :user_uuid', {
      user_uuid: '123',
    })
    expect(selectQueryBuilder.orderBy).toHaveBeenCalledWith('ends_at', 'DESC')
    expect(selectQueryBuilder.getMany).toHaveBeenCalled()
    expect(result).toBeNull()
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

  it('should find subscriptions by id', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.getMany = jest.fn().mockReturnValue([subscription])

    const result = await createRepository().findBySubscriptionId(123)

    expect(selectQueryBuilder.where).toHaveBeenCalledWith('subscription_id = :subscriptionId', {
      subscriptionId: 123,
    })
    expect(selectQueryBuilder.getMany).toHaveBeenCalled()
    expect(result).toEqual([subscription])
  })

  it('should find subscriptions by id and type', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.getMany = jest.fn().mockReturnValue([subscription])

    const result = await createRepository().findBySubscriptionIdAndType(123, UserSubscriptionType.Regular)

    expect(selectQueryBuilder.where).toHaveBeenCalledWith(
      'subscription_id = :subscriptionId AND subscription_type = :type',
      {
        subscriptionId: 123,
        type: 'regular',
      },
    )
    expect(selectQueryBuilder.getMany).toHaveBeenCalled()
    expect(result).toEqual([subscription])
  })

  it('should find one subscription by id and user uuid', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.getOne = jest.fn().mockReturnValue(subscription)

    const result = await createRepository().findOneByUserUuidAndSubscriptionId('1-2-3', 5)

    expect(selectQueryBuilder.where).toHaveBeenCalledWith(
      'user_uuid = :userUuid AND subscription_id = :subscriptionId',
      {
        subscriptionId: 5,
        userUuid: '1-2-3',
      },
    )
    expect(selectQueryBuilder.getOne).toHaveBeenCalled()
    expect(result).toEqual(subscription)
  })

  it('should find one subscription by uuid', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => selectQueryBuilder)

    selectQueryBuilder.where = jest.fn().mockReturnThis()
    selectQueryBuilder.getOne = jest.fn().mockReturnValue(subscription)

    const result = await createRepository().findOneByUuid('1-2-3')

    expect(selectQueryBuilder.where).toHaveBeenCalledWith('uuid = :uuid', {
      uuid: '1-2-3',
    })
    expect(selectQueryBuilder.getOne).toHaveBeenCalled()
    expect(result).toEqual(subscription)
  })
})
