import 'reflect-metadata'

import { TokenDecoder } from './TokenDecoder'

describe('TokenDecoder', () => {
  const jwtSecret = 'secret'

  const createDecoder = () =>
    new TokenDecoder<{ iat: number; pw_hash: string; sub: string; user_uuid: string }>(jwtSecret)

  it('should decode a token', () => {
    expect(
      createDecoder().decodeToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcl91dWlkIjoiMTIzIiwicHdfaGFzaCI6IjlmODZkMDgxODg0YzdkNjU5YTJmZWFhMGM1NWFkMDE1YTNiZjRmMWIyYjBiODIyY2QxNWQ2YzE1YjBmMDBhMDgiLCJpYXQiOjE1MTYyMzkwMjJ9.TXDPCbCAITDjcUUorHsF4S5Nxkz4eFE4F3TPCsKI89A',
      ),
    ).toEqual({
      iat: 1516239022,
      pw_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      sub: '1234567890',
      user_uuid: '123',
    })
  })

  it('should not decode a session token with wrong encoding', () => {
    expect(
      createDecoder().decodeToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyqeqwJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcl91dWlkIjoiMTIzIiwicHdfaGFzaCI6IjlmODZkMDgxODg0YzdkNjU5YTJmZWFhMGM1NWFkMDE1YTNiZjRmMWIyYjBiODIyY2QxNWQ2YzE1YjBmMDBhMDgiLCJpYXQiOjE1MTYyMzkwMjJ9.g32nbZ046pRwSe1iHwWEfsNNBRnAKqXshQKRtCuX1Zw',
      ),
    ).toBeUndefined()
  })
})
