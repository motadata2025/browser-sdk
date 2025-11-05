import type { RumConfiguration } from '@motadata365/browser-rum-core'
import { getSessionReplayUrl } from '@motadata365/browser-rum-core'

export function getSessionReplayLink(configuration: RumConfiguration): string | undefined {
  return getSessionReplayUrl(configuration, { errorType: 'slim-package' })
}
