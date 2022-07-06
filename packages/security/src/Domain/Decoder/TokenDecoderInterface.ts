export interface TokenDecoderInterface<T> {
  decodeToken(token: string): T | undefined
}
