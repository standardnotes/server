import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'

import { ContentTypeProps } from './ContentTypeProps'

export class ContentType extends ValueObject<ContentTypeProps> {
  static readonly TYPES = {
    Any: '*',
    Item: 'SF|Item',
    KeySystemItemsKey: 'SN|KeySystemItemsKey',
    KeySystemRootKey: 'SN|KeySystemRootKey',
    TrustedContact: 'SN|TrustedContact',
    VaultListing: 'SN|VaultListing',
    RootKey: 'SN|RootKey|NoSync',
    ItemsKey: 'SN|ItemsKey',
    EncryptedStorage: 'SN|EncryptedStorage',
    Privileges: 'SN|Privileges',
    Note: 'Note',
    Tag: 'Tag',
    SmartView: 'SN|SmartTag',
    Component: 'SN|Component',
    Editor: 'SN|Editor',
    ActionsExtension: 'Extension',
    UserPrefs: 'SN|UserPreferences',
    HistorySession: 'SN|HistorySession',
    Theme: 'SN|Theme',
    File: 'SN|File',
    FilesafeCredentials: 'SN|FileSafe|Credentials',
    FilesafeFileMetadata: 'SN|FileSafe|FileMetadata',
    FilesafeIntegration: 'SN|FileSafe|Integration',
    ExtensionRepo: 'SN|ExtensionRepo',
    Unknown: 'Unknown',
  }

  private readonly displayNamesMap: Partial<Record<string, string>> = {
    [ContentType.TYPES.ActionsExtension]: 'action-based extension',
    [ContentType.TYPES.Component]: 'component',
    [ContentType.TYPES.Editor]: 'editor',
    [ContentType.TYPES.File]: 'file',
    [ContentType.TYPES.FilesafeCredentials]: 'FileSafe credential',
    [ContentType.TYPES.FilesafeFileMetadata]: 'FileSafe file',
    [ContentType.TYPES.FilesafeIntegration]: 'FileSafe integration',
    [ContentType.TYPES.ItemsKey]: 'encryption key',
    [ContentType.TYPES.Note]: 'note',
    [ContentType.TYPES.SmartView]: 'smart view',
    [ContentType.TYPES.Tag]: 'tag',
    [ContentType.TYPES.Theme]: 'theme',
    [ContentType.TYPES.UserPrefs]: 'user preferences',
  }

  get value(): string | null {
    return this.props.value
  }

  private constructor(props: ContentTypeProps) {
    super(props)
  }

  static create(type: string | null): Result<ContentType> {
    if (type === null) {
      return Result.ok<ContentType>(new ContentType({ value: null }))
    }

    const isValidType = Object.values(this.TYPES).includes(type)
    if (!isValidType) {
      return Result.fail<ContentType>(`Invalid content type: ${type}`)
    } else {
      return Result.ok<ContentType>(new ContentType({ value: type }))
    }
  }

  getDisplayName(): string | null {
    if (!this.value) {
      return null
    }

    return this.displayNamesMap[this.value] || this.value
  }
}
