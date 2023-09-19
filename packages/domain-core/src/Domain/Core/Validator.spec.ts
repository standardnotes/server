import { Validator } from './Validator'

describe('Validator', () => {
  const validUuids = [
    '2221101c-1da9-4d2b-9b32-b8be2a8d1c82',
    'c08f2f29-a74b-42b4-aefd-98af9832391c',
    'b453fa64-1493-443b-b5bb-bca7b9c696c7',
    'fa7350b3-77cf-8c0c-40b2-6046b13254fe',
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

  const validEmails = [
    'something@something.com',
    'someone@localhost.localdomain',
    'a/b@domain.com',
    '{}@domain.com',
    'karol+test@standardnotes.com',
    "m*'!%@something.sa",
    'tu!!7n7.ad##0!!!@company.ca',
    '%@com.com',
    "!#$%&'*+/=?^_`{|}~.-@com.com",
    'someone@do-ma-in.com',
    '""testlah""@example.com',
  ]

  const invalidEmails = [
    'someone@127.0.0.1',
    'a@b.b',
    '',
    null,
    '.wooly@example.com',
    'wo..oly@example.com',
    'somebody@example',
    'a@p.com',
  ]

  it('should validate proper uuids', () => {
    for (const validUuid of validUuids) {
      expect(Validator.isValidUuid(validUuid).isFailed()).toBeFalsy()
    }
  })

  it('should not validate invalid uuids', () => {
    for (const invalidUuid of invalidUuids) {
      expect(Validator.isValidUuid(invalidUuid as string).isFailed()).toBeTruthy()
    }
  })

  it('should validate proper emails', () => {
    for (const validEmail of validEmails) {
      expect(Validator.isValidEmail(validEmail).isFailed()).toBeFalsy()
    }
  })

  it('should not validate invalid emails', () => {
    for (const invalidEmail of invalidEmails) {
      expect(Validator.isValidEmail(invalidEmail as string).isFailed()).toBeTruthy()
    }
  })

  it('should validate value if not empty', () => {
    for (const value of [1, 'foobar', {}, 0]) {
      expect(Validator.isNotEmpty(value).isFailed()).toBeFalsy()
    }
  })

  it('should not validate value if empty', () => {
    for (const value of [null, undefined, '', []]) {
      expect(Validator.isNotEmpty(value).isFailed()).toBeTruthy()
    }
  })

  describe('is not empty string', () => {
    it('should not validate invalid string', () => {
      expect(Validator.isNotEmptyString(123 as unknown as string).isFailed()).toBeTruthy()
    })

    it('should not validate an empty string', () => {
      expect(Validator.isNotEmptyString('').isFailed()).toBeTruthy()
    })

    it('should validate a string', () => {
      expect(Validator.isNotEmptyString('foo').isFailed()).toBeFalsy()
    })
  })
})
