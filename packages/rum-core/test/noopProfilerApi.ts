import type { ProfilerApi } from '@motadata365/browser-rum-core'
import { noop } from '@motadata365/browser-core'

export const noopProfilerApi: ProfilerApi = {
  stop: noop,
  onRumStart: noop,
}
