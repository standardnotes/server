export interface CryptoTotpInterface {
  /**
   * Generate an OTP secret for TOTP authentication
   */
  generateOtpSecret(): Promise<string>

  /**
   * Generate a HOTP token
   * @param secret - Base32 encoded secret
   * @param counter - Counter value
   * @param tokenLength - Length of the generated token (default: 6)
   */
  hotpToken(secret: string, counter: number, tokenLength?: number): Promise<string>

  /**
   * Generate a TOTP token
   * @param secret - Base32 encoded secret
   * @param timestamp - Current timestamp in milliseconds
   * @param tokenLength - Length of the generated token (default: 6)
   * @param step - Time step in seconds (default: 30)
   */
  totpToken(secret: string, timestamp: number, tokenLength?: number, step?: number): Promise<string>
}
