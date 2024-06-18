export interface CaptchaServerInterface {
  verify(hvmToken: string): Promise<boolean>
}
