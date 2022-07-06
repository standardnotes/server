import 'reflect-metadata'

import { SelectorInterface } from '@standardnotes/security'
import { ProtocolVersion } from '@standardnotes/common'

import { KeyParamsFactory } from './KeyParamsFactory'
import { User } from './User'

describe('KeyParamsFactory', () => {
  let user: User
  let protocolVersionSelector: SelectorInterface<ProtocolVersion>

  const createFactory = () => new KeyParamsFactory('secret_key', protocolVersionSelector)

  beforeEach(() => {
    user = new User()
    user.version = 'test'
    user.email = 'test@test.te'
    user.kpCreated = 'kpCreated'
    user.kpOrigination = 'kpOrigination'
    user.pwNonce = 'pwNonce'
    user.pwCost = 1
    user.pwSalt = 'qwe'
    user.pwAlg = 'pwAlg'
    user.pwFunc = 'pwFunc'
    user.pwKeySize = 2

    protocolVersionSelector = {} as jest.Mocked<SelectorInterface<ProtocolVersion>>
    protocolVersionSelector.select = jest.fn().mockReturnValue(ProtocolVersion.V004)
  })

  it('should create a basic key params structure', () => {
    expect(createFactory().create(user, true)).toEqual({
      identifier: 'test@test.te',
      version: 'test',
    })
  })

  it('should create a key params structure for 001 version', () => {
    user.version = '001'

    expect(createFactory().create(user, true)).toEqual({
      email: 'test@test.te',
      identifier: 'test@test.te',
      pw_alg: 'pwAlg',
      pw_cost: 1,
      pw_func: 'pwFunc',
      pw_key_size: 2,
      pw_salt: 'qwe',
      version: '001',
    })
  })

  it('should create a key params structure for 002 version', () => {
    user.version = '002'

    expect(createFactory().create(user, true)).toEqual({
      email: 'test@test.te',
      identifier: 'test@test.te',
      pw_cost: 1,
      pw_salt: 'qwe',
      version: '002',
    })
  })

  it('should create a key params structure for 003 version', () => {
    user.version = '003'

    expect(createFactory().create(user, true)).toEqual({
      identifier: 'test@test.te',
      pw_cost: 1,
      pw_nonce: 'pwNonce',
      version: '003',
    })
  })

  it('should create a key params structure for 004 version', () => {
    user.version = '004'

    expect(createFactory().create(user, true)).toEqual({
      identifier: 'test@test.te',
      created: 'kpCreated',
      origination: 'kpOrigination',
      pw_nonce: 'pwNonce',
      version: '004',
    })
  })

  it('should create a key params structure for not authenticated 004 version', () => {
    user.version = '004'

    expect(createFactory().create(user, false)).toEqual({
      identifier: 'test@test.te',
      pw_nonce: 'pwNonce',
      version: '004',
    })
  })

  it('should create pseudo key params', () => {
    expect(createFactory().createPseudoParams('test@test.te')).toEqual({
      identifier: 'test@test.te',
      pw_nonce: '2552d8b41fc63fcdbd8d07ef4d26a4e6fc61742b348e7094838b1e738c318736',
      version: '004',
    })
  })

  it('should create a key params with sorted keys', () => {
    user.version = '003'

    const expectedKeysOrder = ['identifier', 'pw_cost', 'pw_nonce', 'version']
    const keyParams = createFactory().create(user, true)
    Object.keys(keyParams).forEach((key, index) => {
      expect(key).toEqual(expectedKeysOrder[index])
    })
  })
})
