import { noop } from '@motadata365/browser-core'
import type { ProfilerApi } from '@motadata365/browser-rum-core'

export function makeProfilerApiStub(): ProfilerApi {
  return {
    onRumStart: noop,
    stop: noop,
  }
}
