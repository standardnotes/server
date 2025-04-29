import { Username } from './Username'

describe('Username', () => {
  it('should create a value object', () => {
    const valueOrError = Username.create('test@test.te')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('test@test.te')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = Username.create('')

    expect(valueOrError.isFailed()).toBeTruthy()
  })

  it('should not create an invalid type object', () => {
    const valueOrError = Username.create(undefined as unknown as string)

    expect(valueOrError.isFailed()).toBeTruthy()
  })

  it('should indicate if the username is potentially a vault account', () => {
    const value = Username.create('a75a31ce95365904ef0e0a8e6cefc1f5e99adfef81bbdb6d4499eeb10ae0ff67').getValue()

    expect(value.isPotentiallyAPrivateUsernameAccount()).toBeTruthy()
  })

  it('should indicate if the user is not a vault account', () => {
    const value = Username.create('test@test.te').getValue()

    expect(value.isPotentiallyAPrivateUsernameAccount()).toBeFalsy()
  })

  describe('username validation', () => {
    describe('valid usernames', () => {
      const validUsernames = [
        'johndoe',
        'john_doe',
        'john.doe',
        'john-doe',
        'john@doe',
        'john123',
        'j0hn.d0e',
        'user+name',
        'username_with_single_underscore',
        // Maximum length
        'a'.repeat(100),
        // Minimum length
        'abc',
        // Email variants
        'user@example.com',
        'user.name@example.com',
        'user+test@example.com',
        'user-name@example.com',
        'user_name@example.com',
        'user123@example.com',
        'u@example.com',
        'user@sub.example.com',
        'user@example-site.com',
        'user@example.co.uk',
        'user+test+extra@example.com',
        'user-name-extra@example.com',
        'user.name.extra@example.com',
        'user.name+test-extra@example.com',
        'user-name.test+extra@example.com',
      ]

      test.each(validUsernames)('should accept valid username: %s', (username) => {
        const result = Username.create(username)
        expect(result.isFailed()).toBeFalsy()
        expect(result.getValue().value).toBe(username.toLowerCase())
      })
    })

    describe('invalid usernames', () => {
      const invalidUsernames = [
        // Length violations
        ['ab', 'Username must be at least 3 characters long'],
        ['a'.repeat(101), 'Username cannot be longer than 100 characters'],

        // Empty or whitespace
        ['', 'Username cannot be empty'],
        [' ', 'Username cannot be empty'],
        ['   ', 'Username cannot be empty'],

        // Whitespace in username
        ['user name', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ['user\tname', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ['user\nname', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],

        // Starting/ending with special characters
        [
          '_username',
          'Username cannot start or end with special characters, and cannot have consecutive special characters',
        ],
        [
          'username_',
          'Username cannot start or end with special characters, and cannot have consecutive special characters',
        ],
        [
          '.username',
          'Username cannot start or end with special characters, and cannot have consecutive special characters',
        ],
        [
          'username.',
          'Username cannot start or end with special characters, and cannot have consecutive special characters',
        ],

        // Consecutive special characters
        [
          'user__name',
          'Username cannot start or end with special characters, and cannot have consecutive special characters',
        ],
        [
          'user..name',
          'Username cannot start or end with special characters, and cannot have consecutive special characters',
        ],
        [
          'user.-name',
          'Username cannot start or end with special characters, and cannot have consecutive special characters',
        ],

        // Invalid special characters
        ['user{name}', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ['user#name', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ['user$name', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ['user&name', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ['user*name', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ['user!name', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ['user/name', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ['user\\name', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ['user"name', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ["user'name", 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ['user:name', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        ['user=name', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],

        // HTML-like patterns
        ['<script>', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],
        [
          'user<tag>name',
          'Username can only contain letters, numbers, and the following special characters: . _ - @ +',
        ],
        ['<>', 'Username can only contain letters, numbers, and the following special characters: . _ - @ +'],

        // Invalid types
        [undefined, 'Username must be a string'],
        [null, 'Username must be a string'],
        [123, 'Username must be a string'],
        [true, 'Username must be a string'],
        [{}, 'Username must be a string'],
        [[], 'Username must be a string'],
      ] as [unknown, string][]

      test.each(invalidUsernames)('should reject invalid username: %s', (username, expectedError) => {
        const result = Username.create(username as string)
        expect(result.isFailed()).toBeTruthy()
        expect(result.getError()).toBe(expectedError)
      })
    })

    describe('case sensitivity and trimming', () => {
      it('should convert username to lowercase', () => {
        const result = Username.create('UserName')
        expect(result.isFailed()).toBeFalsy()
        expect(result.getValue().value).toBe('username')
      })

      it('should trim whitespace from username', () => {
        const result = Username.create('  username  ')
        expect(result.isFailed()).toBeFalsy()
        expect(result.getValue().value).toBe('username')
      })

      it('should trim and convert to lowercase', () => {
        const result = Username.create('  UserName  ')
        expect(result.isFailed()).toBeFalsy()
        expect(result.getValue().value).toBe('username')
      })
    })

    describe('special patterns', () => {
      it('should handle single special characters correctly', () => {
        const result = Username.create('user_name.test-email@domain+plus')
        expect(result.isFailed()).toBeFalsy()
        expect(result.getValue().value).toBe('user_name.test-email@domain+plus')
      })

      it('should reject consecutive special characters', () => {
        const consecutivePatterns = ['user__name', 'user..name', 'user.-name', 'user@_name', 'user+.name']

        consecutivePatterns.forEach((username) => {
          const result = Username.create(username)
          expect(result.isFailed()).toBeTruthy()
          expect(result.getError()).toBe(
            'Username cannot start or end with special characters, and cannot have consecutive special characters',
          )
        })
      })

      it('should allow special characters separated by alphanumeric characters', () => {
        const result = Username.create('user_name.test-email@domain+plus')
        expect(result.isFailed()).toBeFalsy()
        expect(result.getValue().value).toBe('user_name.test-email@domain+plus')
      })
    })
  })
})
