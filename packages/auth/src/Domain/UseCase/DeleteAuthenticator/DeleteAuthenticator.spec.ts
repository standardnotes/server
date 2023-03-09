import { Dates, Uuid } from '@standardnotes/domain-core'

import { Authenticator } from '../../Authenticator/Authenticator'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { DeleteAuthenticator } from './DeleteAuthenticator'

describe('DeleteAuthenticator', () => {
  let authenticatorRepository: AuthenticatorRepositoryInterface
  let authenticator: Authenticator
  const createUseCase = () => new DeleteAuthenticator(authenticatorRepository)

  beforeEach(() => {
    authenticator = Authenticator.create({
      counter: 1,
      credentialBackedUp: true,
      credentialDeviceType: 'singleDevice',
      credentialId: Buffer.from('credentialId'),
      credentialPublicKey: Buffer.from('credentialPublicKey'),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      dates: Dates.create(new Date(1), new Date(1)).getValue(),
      transports: ['usb'],
    }).getValue()

    authenticatorRepository = {} as jest.Mocked<AuthenticatorRepositoryInterface>
    authenticatorRepository.findById = jest.fn().mockReturnValue(authenticator)
    authenticatorRepository.remove = jest.fn()
  })

  it('should return error if authenticator not found', async () => {
    authenticatorRepository.findById = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toEqual('Authenticator not found')
  })

  it('should return error if authenticator does not belong to user', async () => {
    authenticatorRepository.findById = jest.fn().mockReturnValue({
      ...authenticator,
      props: {
        ...authenticator.props,
        userUuid: Uuid.create('00000000-0000-0000-0000-00000000a000').getValue(),
      },
    })

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toEqual('Authenticator not found')
  })

  it('should delete authenticator', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(false)
    expect(result.getValue()).toEqual('Authenticator deleted')
    expect(authenticatorRepository.remove).toHaveBeenCalled()
  })
})
