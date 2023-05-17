/* istanbul ignore file */
export enum ContentType {
  Any = '*',
  Item = 'SF|Item',
  SharedItemsKey = 'SN|SharedItemsKey',
  Contact = 'SN|Contact',
  RootKey = 'SN|RootKey|NoSync',
  ItemsKey = 'SN|ItemsKey',
  EncryptedStorage = 'SN|EncryptedStorage',
  Privileges = 'SN|Privileges',
  Note = 'Note',
  Tag = 'Tag',
  SmartView = 'SN|SmartTag',
  Component = 'SN|Component',
  Editor = 'SN|Editor',
  ActionsExtension = 'Extension',
  UserPrefs = 'SN|UserPreferences',
  HistorySession = 'SN|HistorySession',
  Theme = 'SN|Theme',
  File = 'SN|File',
  FilesafeCredentials = 'SN|FileSafe|Credentials',
  FilesafeFileMetadata = 'SN|FileSafe|FileMetadata',
  FilesafeIntegration = 'SN|FileSafe|Integration',
  ExtensionRepo = 'SN|ExtensionRepo',
  Unknown = 'Unknown',
}

export function DisplayStringForContentType(contentType: ContentType): string | undefined {
  const map: Partial<Record<ContentType, string>> = {
    [ContentType.ActionsExtension]: 'action-based extension',
    [ContentType.Component]: 'component',
    [ContentType.Editor]: 'editor',
    [ContentType.File]: 'file',
    [ContentType.FilesafeCredentials]: 'FileSafe credential',
    [ContentType.FilesafeFileMetadata]: 'FileSafe file',
    [ContentType.FilesafeIntegration]: 'FileSafe integration',
    [ContentType.ItemsKey]: 'encryption key',
    [ContentType.Note]: 'note',
    [ContentType.SmartView]: 'smart view',
    [ContentType.Tag]: 'tag',
    [ContentType.Theme]: 'theme',
    [ContentType.UserPrefs]: 'user preferences',
  }

  return map[contentType]
}
