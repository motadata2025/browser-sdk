import type { RelativeTime, RumInternalContext } from '@motadata365/browser-core'
import { globalObject, willSyntheticsInjectRum, HookNames, SKIPPED } from '@motadata365/browser-core'
import type { Hooks } from '../hooks'

interface Rum {
  getInternalContext?: (startTime?: RelativeTime) => RumInternalContext | undefined
}

interface BrowserWindow {
  MD_RUM?: Rum
  DD_RUM_SYNTHETICS?: Rum
}

export function startRUMInternalContext(hooks: Hooks) {
  const browserWindow = globalObject as BrowserWindow

  hooks.register(HookNames.Assemble, ({ startTime }) => {
    const internalContext = getRUMInternalContext(startTime)
    if (!internalContext) {
      return SKIPPED
    }

    return internalContext
  })

  hooks.register(HookNames.AssembleTelemetry, ({ startTime }) => {
    const internalContext = getRUMInternalContext(startTime)

    if (!internalContext) {
      return SKIPPED
    }

    return {
      application: { id: internalContext.application_id },
      view: { id: internalContext.view?.id },
      action: { id: internalContext.user_action?.id as string },
    }
  })

  function getRUMInternalContext(startTime?: RelativeTime) {
    const willSyntheticsInjectRumResult = willSyntheticsInjectRum()
    const rumSource = willSyntheticsInjectRumResult ? browserWindow.DD_RUM_SYNTHETICS : browserWindow.MD_RUM
    const rumContext = getInternalContextFromRumGlobal(startTime, rumSource)

    if (rumContext) {
      return rumContext
    }
  }

  function getInternalContextFromRumGlobal(startTime?: RelativeTime, rumGlobal?: Rum): RumInternalContext | undefined {
    if (rumGlobal && rumGlobal.getInternalContext) {
      return rumGlobal.getInternalContext(startTime)
    }
  }
}
