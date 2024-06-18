import { CookieFactoryInterface } from './CookieFactoryInterface'

export class CookieFactory implements CookieFactoryInterface {
  constructor(
    private sameSite: 'None' | 'Lax' | 'Strict',
    private domain: string,
    private secure: boolean,
    private partitioned: boolean,
  ) {}

  createCookieHeaderValue(dto: {
    sessionUuid: string
    accessToken: string
    refreshToken: string
    refreshTokenExpiration: Date
  }): string[] {
    return [
      `access_token_${dto.sessionUuid}=${dto.accessToken}; HttpOnly;${this.secure ? 'Secure; ' : ' '}Path=/;${
        this.partitioned ? 'Partitioned; ' : ' '
      }SameSite=${this.sameSite}; Domain=${this.domain}; Expires=${dto.refreshTokenExpiration.toUTCString()};`,
      `refresh_token_${dto.sessionUuid}=${dto.refreshToken}; HttpOnly;${
        this.secure ? 'Secure; ' : ' '
      }Path=/v1/sessions/refresh;${this.partitioned ? 'Partitioned; ' : ' '}SameSite=${this.sameSite}; Domain=${
        this.domain
      }; Expires=${dto.refreshTokenExpiration.toUTCString()};`,
    ]
  }
}
