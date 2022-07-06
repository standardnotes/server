import 'reflect-metadata'

import { JwtPayload, verify } from 'jsonwebtoken'

import { TokenEncoder } from './TokenEncoder'

describe('TokenEncoder', () => {
  const jwtSecret = 'secret'

  const createEncoder = () => new TokenEncoder<{ user_uuid: string }>(jwtSecret)

  it('should encode a token', () => {
    const encodedToken = createEncoder().encodeToken({ user_uuid: '123' })

    expect((verify(encodedToken, jwtSecret) as JwtPayload).user_uuid).toEqual('123')
    expect((verify(encodedToken, jwtSecret) as JwtPayload).exp).toBeUndefined()
  })

  it('should encode an expirable token', () => {
    const encodedToken = createEncoder().encodeExpirableToken({ user_uuid: '123' }, 123)

    expect((verify(encodedToken, jwtSecret) as JwtPayload).user_uuid).toEqual('123')
    expect((verify(encodedToken, jwtSecret) as JwtPayload).exp).toBeGreaterThan(0)
  })
})
