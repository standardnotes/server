import { NotificationType } from './NotificationType'

describe('NotificationType', () => {
  it('should create a value object', () => {
    const valueOrError = NotificationType.create(NotificationType.TYPES.SharedVaultItemRemoved)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('shared_vault_item_removed')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = NotificationType.create('TEST')

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
