import { motadataRum } from '@motadata365/browser-rum'
import { motadataLogs } from '@motadata365/browser-logs'
import type { RumInitConfiguration } from '@motadata365/browser-rum-core'
import type { LogsInitConfiguration } from '@motadata365/browser-logs'
import type { Context } from '@motadata365/browser-core'

declare global {
  interface Window {
    EXT_RUM_CONFIGURATION?: RumInitConfiguration
    RUM_CONTEXT?: Context
    EXT_LOGS_CONFIGURATION?: LogsInitConfiguration
    LOGS_CONTEXT?: Context
  }
}

if (window.EXT_RUM_CONFIGURATION) {
  motadataRum.init(window.EXT_RUM_CONFIGURATION)

  if (window.RUM_CONTEXT) {
    motadataRum.setGlobalContext(window.RUM_CONTEXT)
  }
}

if (window.EXT_LOGS_CONFIGURATION) {
  motadataLogs.init(window.EXT_LOGS_CONFIGURATION)

  if (window.LOGS_CONTEXT) {
    motadataLogs.setGlobalContext(window.LOGS_CONTEXT)
  }
}
