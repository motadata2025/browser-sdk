import { getGlobalObject } from '@motadata365/browser-core'
import type { Profiler } from './types'

export function isProfilingSupported(): boolean {
  const globalThis = getGlobalObject()

  // This API might be unavailable in some browsers
  const globalThisProfiler: Profiler | undefined = (globalThis as any).Profiler
  return globalThisProfiler !== undefined
}
