import 'reflect-metadata'

import { Time, Timer, TimerInterface } from '@standardnotes/time'
import { ContentType, Dates, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { ApiVersion } from '../../Api/ApiVersion'

import { TimeDifferenceFilter } from './TimeDifferenceFilter'
import { ItemHash } from '../ItemHash'
import { Item } from '../Item'

describe('TimeDifferenceFilter', () => {
  let timer: TimerInterface
  let timeHelper: Timer
  let itemHash: ItemHash
  let existingItem: Item

  const createFilter = () => new TimeDifferenceFilter(timer)

  beforeEach(() => {
    timeHelper = new Timer()

    timer = {} as jest.Mocked<TimerInterface>
    timer.convertStringDateToMicroseconds = jest
      .fn()
      .mockImplementation((date: string) => timeHelper.convertStringDateToMicroseconds(date))

    existingItem = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: null,
        authHash: null,
        itemsKeyId: null,
        duplicateOf: null,
        deleted: false,
        dates: Dates.create(new Date(1616164633241311), new Date(1616164633241311)).getValue(),
        timestamps: Timestamps.create(1616164633241311, 1616164633241311).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    itemHash = ItemHash.create({
      uuid: '1-2-3',
      user_uuid: '00000000-0000-0000-0000-000000000000',
      key_system_identifier: null,
      shared_vault_uuid: null,
      content: 'asdqwe1',
      content_type: ContentType.TYPES.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe1',
      items_key_id: 'asdasd1',
      created_at: timeHelper.formatDate(
        timeHelper.convertMicrosecondsToDate(existingItem.props.timestamps.createdAt),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
      updated_at: timeHelper.formatDate(
        timeHelper.convertMicrosecondsToDate(existingItem.props.timestamps.updatedAt + 1),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
    }).getValue()
  })

  it('should leave non existing items', async () => {
    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '2.200.0',
      itemHash,
      existingItem: null,
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should leave items from legacy clients', async () => {
    itemHash = ItemHash.create({
      ...itemHash.props,
      updated_at: undefined,
      updated_at_timestamp: undefined,
    }).getValue()

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20161215,
      snjsVersion: '2.200.0',
      itemHash,
      existingItem,
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should filter out items having update at timestamp different in microseconds precision', async () => {
    itemHash = ItemHash.create({
      ...itemHash.props,
      updated_at_timestamp: existingItem.props.timestamps.updatedAt + 1,
    }).getValue()

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '2.200.0',
      itemHash,
      existingItem,
    })

    expect(result).toEqual({
      passed: false,
      conflict: {
        serverItem: existingItem,
        type: 'sync_conflict',
      },
    })
  })

  it('should leave items having update at timestamp same in microseconds precision', async () => {
    itemHash = ItemHash.create({
      ...itemHash.props,
      updated_at_timestamp: existingItem.props.timestamps.updatedAt,
    }).getValue()

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '2.200.0',
      itemHash,
      existingItem,
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should filter out items having update at timestamp different by a second for legacy clients', async () => {
    itemHash = ItemHash.create({
      ...itemHash.props,
      updated_at: timeHelper.formatDate(
        new Date(
          timeHelper.convertMicrosecondsToMilliseconds(existingItem.props.timestamps.updatedAt) +
            Time.MicrosecondsInASecond +
            1,
        ),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
    }).getValue()

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20161215,
      itemHash,
      existingItem,
      snjsVersion: '2.200.0',
    })

    expect(result).toEqual({
      passed: false,
      conflict: {
        serverItem: existingItem,
        type: 'sync_conflict',
      },
    })
  })

  it('should leave items having update at timestamp different by less then a second for legacy clients', async () => {
    itemHash = ItemHash.create({
      ...itemHash.props,
      updated_at: timeHelper.formatDate(
        timeHelper.convertMicrosecondsToDate(existingItem.props.timestamps.updatedAt),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
    }).getValue()

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20161215,
      itemHash,
      existingItem,
      snjsVersion: '2.200.0',
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should filter out items having update at timestamp different by a millisecond', async () => {
    itemHash = ItemHash.create({
      ...itemHash.props,
      updated_at: timeHelper.formatDate(
        new Date(
          timeHelper.convertMicrosecondsToMilliseconds(existingItem.props.timestamps.updatedAt) +
            Time.MicrosecondsInAMillisecond +
            1,
        ),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
    }).getValue()

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '2.200.0',
      itemHash,
      existingItem,
    })

    expect(result).toEqual({
      passed: false,
      conflict: {
        serverItem: existingItem,
        type: 'sync_conflict',
      },
    })
  })

  it('should leave items having update at timestamp different by less than a millisecond', async () => {
    itemHash = ItemHash.create({
      ...itemHash.props,
      updated_at: timeHelper.formatDate(
        timeHelper.convertMicrosecondsToDate(existingItem.props.timestamps.updatedAt),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
    }).getValue()

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      snjsVersion: '2.200.0',
      itemHash,
      existingItem,
    })

    expect(result).toEqual({
      passed: true,
    })
  })
})
