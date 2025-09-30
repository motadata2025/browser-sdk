import { getConnectivity, HookNames } from '@motadata365/browser-core'
import type { DefaultRumEventAttributes, Hooks } from '../hooks'

export function startConnectivityContext(hooks: Hooks) {
  hooks.register(
    HookNames.Assemble,
    ({ eventType }): DefaultRumEventAttributes => ({
      type: eventType,
      connectivity: getConnectivity(),
    })
  )
}
