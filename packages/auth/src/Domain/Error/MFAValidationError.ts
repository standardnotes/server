export class MFAValidationError extends Error {
  constructor(
    message: string,
    public tag: string,
    public payload?: Record<string, unknown>,
  ) {
    super(message)
    Object.setPrototypeOf(this, MFAValidationError.prototype)
  }
}
