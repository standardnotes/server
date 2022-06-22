import { Session } from './Session'

describe('Session', () => {
  const createSession = () => new Session()

  it('should instantiate', () => {
    expect(createSession()).toBeInstanceOf(Session)
  })
})
