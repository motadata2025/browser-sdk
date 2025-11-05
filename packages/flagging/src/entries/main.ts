import { defineGlobal, getGlobalObject } from '@motadata365/browser-core'
import { flagging as importedFlagging } from '../hello'

export const motadataFlagging = importedFlagging

interface BrowserWindow extends Window {
  MD_FLAGGING?: typeof motadataFlagging
}
defineGlobal(getGlobalObject<BrowserWindow>(), 'MD_FLAGGING', motadataFlagging)
