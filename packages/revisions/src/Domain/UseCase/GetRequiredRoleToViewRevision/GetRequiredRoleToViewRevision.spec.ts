import { TimerInterface } from '@standardnotes/time'

import { GetRequiredRoleToViewRevision } from './GetRequiredRoleToViewRevision'

describe('GetRequiredRoleToViewRevision', () => {
  let timer: TimerInterface

  const createUseCase = () => new GetRequiredRoleToViewRevision(timer)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
  })

  it('should return CoreUser if revision was created less than 30 days ago', () => {
    timer.dateWasNDaysAgo = jest.fn().mockReturnValue(29)

    const useCase = createUseCase()

    const result = useCase.execute({ createdAt: new Date() })

    expect(result.getValue()).toEqual('CORE_USER')
  })

  it('should return PlusUser if revision was created more than 30 days ago and less than 365 days ago', () => {
    timer.dateWasNDaysAgo = jest.fn().mockReturnValue(31)

    const useCase = createUseCase()

    const result = useCase.execute({ createdAt: new Date() })

    expect(result.getValue()).toEqual('PLUS_USER')
  })

  it('should return ProUser if revision was created more than 365 days ago', () => {
    timer.dateWasNDaysAgo = jest.fn().mockReturnValue(366)

    const useCase = createUseCase()

    const result = useCase.execute({ createdAt: new Date() })

    expect(result.getValue()).toEqual('PRO_USER')
  })
})
