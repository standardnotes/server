import 'reflect-metadata'

import { TokenEncoderInterface, WebSocketConnectionTokenData } from '@standardnotes/security'

import { CreateWebSocketConnectionToken } from './CreateWebSocketConnectionToken'

describe('CreateWebSocketConnection', () => {
  let tokenEncoder: TokenEncoderInterface<WebSocketConnectionTokenData>
  const tokenTTL = 30

  const createUseCase = () => new CreateWebSocketConnectionToken(tokenEncoder, tokenTTL)

  beforeEach(() => {
    tokenEncoder = {} as jest.Mocked<TokenEncoderInterface<WebSocketConnectionTokenData>>
    tokenEncoder.encodeExpirableToken = jest.fn().mockReturnValue('foobar')
  })

  it('should create a web socket connection token', async () => {
    const result = await createUseCase().execute({ userUuid: '1-2-3', sessionUuid: '4-5-6' })

    expect(result.token).toEqual('foobar')

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith({ userUuid: '1-2-3', sessionUuid: '4-5-6' }, 30)
  })
})
