import { UuidValidator } from './UuidValidator'

describe('UuidValidator', () => {
  const createValidator = () => new UuidValidator()

  const validUuids = [
    '2221101c-1da9-4d2b-9b32-b8be2a8d1c82',
    'c08f2f29-a74b-42b4-aefd-98af9832391c',
    'b453fa64-1493-443b-b5bb-bca7b9c696c7',
  ]

  const invalidUuids = [
    123,
    'someone@127.0.0.1',
    '',
    null,
    'b453fa64-1493-443b-b5bb-ca7b9c696c7',
    'c08f*f29-a74b-42b4-aefd-98af9832391c',
    'c08f*f29-a74b-42b4-aefd-98af9832391c',
    '../../escaped.sh',
  ]

  it('should validate proper uuids', () => {
    for (const validUuid of validUuids) {
      expect(createValidator().validate(validUuid)).toBeTruthy()
    }
  })

  it('should not validate invalid uuids', () => {
    for (const invalidUuid of invalidUuids) {
      expect(createValidator().validate(invalidUuid as string)).toBeFalsy()
    }
  })
})
