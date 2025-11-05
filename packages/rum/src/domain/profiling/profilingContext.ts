import { HookNames, SKIPPED } from '@motadata365/browser-core'
import type { Hooks, ProfilingInternalContextSchema } from '@motadata365/browser-rum-core'
import { RumEventType } from '@motadata365/browser-rum-core'

export interface ProfilingContextManager {
  set: (next: ProfilingInternalContextSchema) => void
  get: () => ProfilingInternalContextSchema | undefined
}

export const startProfilingContext = (hooks: Hooks): ProfilingContextManager => {
  // Default status is `starting`.
  let currentContext: ProfilingInternalContextSchema = {
    status: 'starting',
  }

  // Register the assemble hook to add the profiling context to the event attributes.
  hooks.register(HookNames.Assemble, ({ eventType }) => {
    if (eventType !== RumEventType.VIEW && eventType !== RumEventType.LONG_TASK) {
      return SKIPPED
    }

    return {
      type: eventType,
      _md: {
        profiling: currentContext,
      },
    }
  })

  return {
    get: () => currentContext,
    set: (newContext: ProfilingInternalContextSchema) => {
      currentContext = newContext
    },
  }
}
