import { EncryptionVersion } from './EncryptionVersion'

describe('EncryptionVersion', () => {
  it('should create a value object', () => {
    const valueOrError = EncryptionVersion.create(1)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual(1)
  })

  it('should not create an invalid value object', () => {
    let valueOrError = EncryptionVersion.create('asd' as unknown as number)

    expect(valueOrError.isFailed()).toBeTruthy()

    valueOrError = EncryptionVersion.create(null as unknown as number)

    expect(valueOrError.isFailed()).toBeTruthy()

    valueOrError = EncryptionVersion.create(undefined as unknown as number)

    expect(valueOrError.isFailed()).toBeTruthy()

    valueOrError = EncryptionVersion.create(754)

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
