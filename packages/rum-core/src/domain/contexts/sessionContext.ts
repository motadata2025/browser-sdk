import { DISCARDED, HookNames, SKIPPED } from '@motadata365/browser-core'
import { SessionReplayState, SessionType } from '../rumSessionManager'
import type { RumSessionManager } from '../rumSessionManager'
import { RumEventType } from '../../rawRumEvent.types'
import type { RecorderApi } from '../../boot/rumPublicApi'
import type { DefaultRumEventAttributes, DefaultTelemetryEventAttributes, Hooks } from '../hooks'
import type { ViewHistory } from './viewHistory'
import type { LifeCycle } from '../lifeCycle'
import { LifeCycleEventType } from '../lifeCycle'

export function startSessionContext(
  hooks: Hooks,
  sessionManager: RumSessionManager,
  recorderApi: RecorderApi,
  viewHistory: ViewHistory,
  lifeCycle: LifeCycle
) {
  // Track the created timestamp for each session
  const sessionCreatedTimestamps = new Map<string, number>()

  // Clear the map when session expires to prevent memory leaks
  lifeCycle.subscribe(LifeCycleEventType.SESSION_EXPIRED, () => {
    sessionCreatedTimestamps.clear()
  })

  // Subscribe to RAW_RUM_EVENT_COLLECTED to capture and persist the first event's timestamp
  // This runs BEFORE the assembly's Assemble hook is triggered
  lifeCycle.subscribe(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, ({ rawRumEvent, startTime }) => {
    const session = sessionManager.findTrackedSession(startTime)

    if (session && session.id && !sessionCreatedTimestamps.has(session.id)) {
      // Store the first event's timestamp for this session
      const eventDate = rawRumEvent.date
      sessionCreatedTimestamps.set(session.id, eventDate)

      // Persist it to the session state (async, but we don't wait for it)
      sessionManager.updateSessionState({ created: String(eventDate) })
    }
  })

  hooks.register(HookNames.Assemble, ({ eventType, startTime }): DefaultRumEventAttributes | DISCARDED => {
    const session = sessionManager.findTrackedSession(startTime)
    const view = viewHistory.findView(startTime)

    if (!session || !view) {
      return DISCARDED
    }

    // Get the created timestamp: first check our in-memory map, then the session state
    let createdTimestamp: number | undefined
    if (session.id && sessionCreatedTimestamps.has(session.id)) {
      createdTimestamp = sessionCreatedTimestamps.get(session.id)
    } else if (session.created) {
      createdTimestamp = Number(session.created)
      // Cache it in our map for faster access
      if (session.id) {
        sessionCreatedTimestamps.set(session.id, createdTimestamp)
      }
    }

    let hasReplay
    let sampledForReplay
    let isActive
    if (eventType === RumEventType.VIEW) {
      hasReplay = recorderApi.getReplayStats(view.id) ? true : undefined
      sampledForReplay = session.sessionReplay === SessionReplayState.SAMPLED
      isActive = view.sessionIsActive ? undefined : false
    } else {
      hasReplay = recorderApi.isRecording() ? true : undefined
    }

    return {
      type: eventType,
      session: {
        id: session.id,
        type: SessionType.USER,
        has_replay: hasReplay,
        sampled_for_replay: sampledForReplay,
        is_active: isActive,
        created: createdTimestamp,
      },
    }
  })

  hooks.register(HookNames.AssembleTelemetry, ({ startTime }): DefaultTelemetryEventAttributes | SKIPPED => {
    const session = sessionManager.findTrackedSession(startTime)

    if (!session) {
      return SKIPPED
    }

    return {
      session: {
        id: session.id,
      },
    }
  })
}
