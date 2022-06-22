import 'reflect-metadata'

import { ContentType } from '@standardnotes/common'

import { Time, Timer, TimerInterface } from '@standardnotes/time'

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

    existingItem = {
      uuid: '1-2-3',
      userUuid: '1-2-3',
      createdAt: new Date(1616164633241311),
      createdAtTimestamp: 1616164633241311,
      updatedAt: new Date(1616164633241311),
      updatedAtTimestamp: 1616164633241311,
    } as jest.Mocked<Item>

    itemHash = {
      uuid: '1-2-3',
      content: 'asdqwe1',
      content_type: ContentType.Note,
      duplicate_of: null,
      enc_item_key: 'qweqwe1',
      items_key_id: 'asdasd1',
      created_at: timeHelper.formatDate(
        timeHelper.convertMicrosecondsToDate(existingItem.createdAtTimestamp),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
      updated_at: timeHelper.formatDate(
        timeHelper.convertMicrosecondsToDate(existingItem.updatedAtTimestamp + 1),
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ),
    } as jest.Mocked<ItemHash>
  })

  it('should leave non existing items', async () => {
    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash,
      existingItem: null,
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should leave items from legacy clients', async () => {
    delete itemHash.updated_at
    delete itemHash.updated_at_timestamp

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20161215,
      itemHash,
      existingItem,
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should filter out items having update at timestamp different in microseconds precision', async () => {
    itemHash.updated_at_timestamp = existingItem.updatedAtTimestamp + 1

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
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
    itemHash.updated_at_timestamp = existingItem.updatedAtTimestamp

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash,
      existingItem,
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should filter out items having update at timestamp different by a second for legacy clients', async () => {
    itemHash.updated_at = timeHelper.formatDate(
      new Date(
        timeHelper.convertMicrosecondsToMilliseconds(existingItem.updatedAtTimestamp) + Time.MicrosecondsInASecond + 1,
      ),
      'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
    )

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20161215,
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

  it('should leave items having update at timestamp different by less then a second for legacy clients', async () => {
    itemHash.updated_at = timeHelper.formatDate(
      timeHelper.convertMicrosecondsToDate(existingItem.updatedAtTimestamp),
      'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
    )

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20161215,
      itemHash,
      existingItem,
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should filter out items having update at timestamp different by a millisecond', async () => {
    itemHash.updated_at = timeHelper.formatDate(
      new Date(
        timeHelper.convertMicrosecondsToMilliseconds(existingItem.updatedAtTimestamp) +
          Time.MicrosecondsInAMillisecond +
          1,
      ),
      'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
    )

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
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
    itemHash.updated_at = timeHelper.formatDate(
      timeHelper.convertMicrosecondsToDate(existingItem.updatedAtTimestamp),
      'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
    )

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash,
      existingItem,
    })

    expect(result).toEqual({
      passed: true,
    })
  })
})
