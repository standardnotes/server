import 'reflect-metadata'
import { ApiVersion } from '../../Api/ApiVersion'
import { ItemHash } from '../ItemHash'
import { ItemSaveRuleInterface } from '../SaveRule/ItemSaveRuleInterface'

import { ItemSaveValidator } from './ItemSaveValidator'

describe('ItemSaveValidator', () => {
  let rule: ItemSaveRuleInterface
  let itemHash: ItemHash

  const createProcessor = () => new ItemSaveValidator([rule])

  beforeEach(() => {
    rule = {} as jest.Mocked<ItemSaveRuleInterface>
    rule.check = jest.fn().mockReturnValue({ passed: true })

    itemHash = {} as jest.Mocked<ItemHash>
  })

  it('should run item through all filters with passing', async () => {
    const result = await createProcessor().validate({
      apiVersion: ApiVersion.v20200115,
      userUuid: '1-2-3',
      itemHash,
      existingItem: null,
      snjsVersion: '2.200.0',
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should run item through all filters with not passing', async () => {
    rule.check = jest.fn().mockReturnValue({ passed: false })

    const result = await createProcessor().validate({
      apiVersion: ApiVersion.v20200115,
      userUuid: '1-2-3',
      itemHash,
      existingItem: null,
      snjsVersion: '2.200.0',
    })

    expect(result).toEqual({
      passed: false,
    })
  })
})
