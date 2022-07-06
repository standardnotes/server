export interface TokenEncoderInterface<T> {
  encodeToken(data: T): string
  encodeExpirableToken(data: T, expiresIn: number): string
}
