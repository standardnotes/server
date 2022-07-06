import { verify } from 'jsonwebtoken'

import { TokenDecoderInterface } from './TokenDecoderInterface'
export class TokenDecoder<T> implements TokenDecoderInterface<T> {
  constructor(private jwtSecret: string) {}

  decodeToken(token: string): T | undefined {
    try {
      return <T>verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
      })
    } catch (error) {
      return undefined
    }
  }
}
