import type { ServerDuration } from '@motadata365/browser-core'
import { isNumber } from '@motadata365/browser-core'

export function discardNegativeDuration(duration: ServerDuration | undefined): ServerDuration | undefined {
  return isNumber(duration) && duration < 0 ? undefined : duration
}
