import { sign } from 'jsonwebtoken'

import { TokenEncoderInterface } from './TokenEncoderInterface'

export class TokenEncoder<T> implements TokenEncoderInterface<T> {
  constructor(private jwtSecret: string) {}

  encodeExpirableToken(data: T, expiresIn: string | number | undefined): string {
    return sign(data as Record<string, unknown>, this.jwtSecret, { algorithm: 'HS256', expiresIn })
  }

  encodeToken(data: T): string {
    return sign(data as Record<string, unknown>, this.jwtSecret, { algorithm: 'HS256' })
  }
}
