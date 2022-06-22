import 'reflect-metadata'

import { ContentDecoder } from './ContentDecoder'

describe('ContentDecoder', () => {
  const createDecoder = () => new ContentDecoder()

  it('should decode content', () => {
    const content = '000eyJmb28iOiJiYXIifQ=='

    expect(createDecoder().decode(content)).toEqual({
      foo: 'bar',
    })
  })

  it('should encode content', () => {
    expect(
      createDecoder().encode({
        foo: 'bar',
      }),
    ).toEqual('000eyJmb28iOiJiYXIifQ==')
  })

  it('should return empty object on decoding failure', () => {
    const content = '032400eyJmb28iOiJiYXIifQ=='

    expect(createDecoder().decode(content)).toEqual({})
  })
})
