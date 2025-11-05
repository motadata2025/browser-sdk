import type { RumInitConfiguration, RumPublicApi } from '@motadata365/browser-rum-core'
import type { LogsInitConfiguration, LogsGlobal } from '@motadata365/browser-logs'
import type { Context } from '@motadata365/browser-core'

declare global {
  interface Window {
    RUM_BUNDLE_URL?: string
    LOGS_BUNDLE_URL?: string
    EXT_RUM_CONFIGURATION?: RumInitConfiguration
    RUM_CONTEXT?: Context
    EXT_LOGS_CONFIGURATION?: LogsInitConfiguration
    LOGS_CONTEXT?: Context
    MD_RUM?: RumPublicApi
    MD_LOGS?: LogsGlobal
  }
}

function load<T extends 'MD_RUM' | 'MD_LOGS'>(
  sdk: T,
  url: string,
  initConfig: T extends 'MD_RUM' ? RumInitConfiguration : LogsInitConfiguration,
  globalContext?: Context
) {
  const script = document.createElement('script')
  script.src = url
  script.onload = () => {
    if (!window[sdk]) {
      console.error(`${sdk} is not loaded`)
      return
    }

    window[sdk].init(initConfig as any)
    if (globalContext) {
      window[sdk].setGlobalContext(globalContext)
    }
  }

  document.documentElement.appendChild(script)
}

if (window.RUM_BUNDLE_URL && window.EXT_RUM_CONFIGURATION) {
  load('MD_RUM', window.RUM_BUNDLE_URL, window.EXT_RUM_CONFIGURATION, window.RUM_CONTEXT)
}

if (window.LOGS_BUNDLE_URL && window.EXT_LOGS_CONFIGURATION) {
  load('MD_LOGS', window.LOGS_BUNDLE_URL, window.EXT_LOGS_CONFIGURATION, window.LOGS_CONTEXT)
}
