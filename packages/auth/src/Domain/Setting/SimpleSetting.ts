import { Setting } from './Setting'

export type SimpleSetting = Omit<Setting, 'user' | 'serverEncryptionVersion'>
