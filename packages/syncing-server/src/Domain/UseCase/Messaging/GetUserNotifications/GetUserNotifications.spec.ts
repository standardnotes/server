import { NotificationRepositoryInterface } from '../../../Notifications/NotificationRepositoryInterface'
import { GetUserNotifications } from './GetUserNotifications'

describe('GetUserNotifications', () => {
  let notificationRepository: NotificationRepositoryInterface

  const createUseCase = () => new GetUserNotifications(notificationRepository)

  beforeEach(() => {
    notificationRepository = {} as jest.Mocked<NotificationRepositoryInterface>
    notificationRepository.findByUserUuid = jest.fn().mockReturnValue([])
    notificationRepository.findByUserUuidUpdatedAfter = jest.fn().mockReturnValue([])
  })

  it('should return notification for user', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.getValue()).toEqual([])
  })

  it('should return notifications for user updated after given time', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      lastSyncTime: 123,
    })

    expect(result.getValue()).toEqual([])
  })

  it('should return error when user uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })
})
