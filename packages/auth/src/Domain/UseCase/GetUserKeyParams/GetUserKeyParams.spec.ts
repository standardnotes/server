import 'reflect-metadata'
import { Logger } from 'winston'

import { KeyParamsFactoryInterface } from '../../User/KeyParamsFactoryInterface'
import { PKCERepositoryInterface } from '../../User/PKCERepositoryInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GetUserKeyParams } from './GetUserKeyParams'

describe('GetUserKeyParams', () => {
  let keyParamsFactory: KeyParamsFactoryInterface
  let userRepository: UserRepositoryInterface
  let logger: Logger
  let user: User
  let pkceRepository: PKCERepositoryInterface

  const createUseCase = () => new GetUserKeyParams(keyParamsFactory, userRepository, pkceRepository, logger)

  beforeEach(() => {
    keyParamsFactory = {} as jest.Mocked<KeyParamsFactoryInterface>
    keyParamsFactory.create = jest.fn().mockReturnValue({ foo: 'bar' })
    keyParamsFactory.createPseudoParams = jest.fn().mockReturnValue({ bar: 'baz' })

    user = {} as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    pkceRepository = {} as jest.Mocked<PKCERepositoryInterface>
    pkceRepository.storeCodeChallenge = jest.fn()
  })

  it('should get key params for an authenticated user - searching by email', async () => {
    expect(await createUseCase().execute({ email: 'test@test.te', authenticated: true })).toEqual({
      keyParams: {
        foo: 'bar',
      },
    })

    expect(keyParamsFactory.create).toHaveBeenCalledWith(user, true)
  })

  it('should throw an error when searching by email and the email is invalid', async () => {
    await expect(createUseCase().execute({ email: '', authenticated: false })).rejects.toThrowError(
      'Username cannot be empty',
    )
  })

  it('should get key params for an unauthenticated user - searching by email', async () => {
    expect(await createUseCase().execute({ email: 'test@test.te', authenticated: false })).toEqual({
      keyParams: {
        foo: 'bar',
      },
    })

    expect(keyParamsFactory.create).toHaveBeenCalledWith(user, false)
  })

  it('should get key params for an authenticated user - searching by uuid', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3', authenticated: true })).toEqual({
      keyParams: {
        foo: 'bar',
      },
    })

    expect(keyParamsFactory.create).toHaveBeenCalledWith(user, true)
  })

  it('should get key params for an unauthenticated user - searching by uuid', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3', authenticated: false })).toEqual({
      keyParams: {
        foo: 'bar',
      },
    })

    expect(keyParamsFactory.create).toHaveBeenCalledWith(user, false)
  })

  it("should get key params for an unauthenticated user and store it's code challenge", async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3', authenticated: false, codeChallenge: 'test' })).toEqual({
      keyParams: {
        foo: 'bar',
      },
    })

    expect(pkceRepository.storeCodeChallenge).toHaveBeenCalledWith('test')
  })

  it('should get pseudo key params for a non existing user - when searching by email', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ email: 'test@test.te', authenticated: false })).toEqual({
      keyParams: {
        bar: 'baz',
      },
    })

    expect(keyParamsFactory.createPseudoParams).toHaveBeenCalledWith('test@test.te')
  })

  it('should throw error for a non existing user - when searching by uuid', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    let error = null
    try {
      await createUseCase().execute({ userUuid: '1-2-3', authenticated: false })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should throw error for a non existing user - when search parameters are not given', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    let error = null
    try {
      await createUseCase().execute({ authenticated: false })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })
})
