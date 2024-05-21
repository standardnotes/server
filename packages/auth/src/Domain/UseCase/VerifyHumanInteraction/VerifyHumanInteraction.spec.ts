import { VerifyHumanInteraction } from './VerifyHumanInteraction'
import { CaptchaServerInterface } from '../../HumanVerification/CaptchaServerInterface'

describe('HumanVerification', () => {
  let captchaServer: CaptchaServerInterface
  const createHumanVerification = () => new VerifyHumanInteraction(true, captchaServer)

  beforeEach(() => {
    captchaServer = {} as jest.Mocked<CaptchaServerInterface>
    captchaServer.verify = jest.fn().mockReturnValue(true)
  })

  describe('Verified', () => {
    it('should pass human verification', async () => {
      captchaServer.verify = jest.fn().mockReturnValue(true)
      const result = await createHumanVerification().execute('foobar')
      expect(result.isFailed()).toBeFalsy()
    })

    it('should not pass human verification if token is missing', async () => {
      const result = await createHumanVerification().execute()
      expect(result.isFailed()).toBeTruthy()
    })

    it('should pass human verification when verification disabled', async () => {
      const result = await new VerifyHumanInteraction(false, captchaServer).execute('foobar')
      expect(result.isFailed()).toBeFalsy()
    })

    it('should pass human verification when no captcha url defined', async () => {
      const result = await new VerifyHumanInteraction(true, captchaServer).execute('foobar')
      expect(result.isFailed()).toBeFalsy()
    })
  })

  describe('Unverified', () => {
    it('should pass not human verification', async () => {
      captchaServer.verify = jest.fn().mockReturnValue(false)
      const result = await createHumanVerification().execute('foobar')
      expect(result.isFailed()).toBeTruthy()
    })
  })
})
