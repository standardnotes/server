import { ContentType } from './ContentType'

describe('ContentType', () => {
  it('should create a value object', () => {
    const valueOrError = ContentType.create(ContentType.TYPES.Component)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('SIGN_IN')
  })

  it('should not create an invalid value object', () => {
    for (const value of ['', undefined, null, 0, 'FOOBAR']) {
      const valueOrError = ContentType.create(value as string)

      expect(valueOrError.isFailed()).toBeTruthy()
    }
  })

  it('should return a display name', () => {
    const valueOrError = ContentType.create(ContentType.TYPES.FilesafeFileMetadata)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().getDisplayName()).toEqual('FileSafe file')
  })

  it('should return null for a display name if the value is null', () => {
    const valueOrError = ContentType.create(null)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().getDisplayName()).toBeNull()
  })
})
