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
  // Track which sessions have had their created timestamp set
  const sessionsWithCreatedTimestamp = new Set<string>()

  // Subscribe to RAW_RUM_EVENT_COLLECTED to set session.created from the first event
  lifeCycle.subscribe(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, ({ rawRumEvent, startTime }) => {
    const session = sessionManager.findTrackedSession(startTime)

    if (session && session.id && !session.created && !sessionsWithCreatedTimestamp.has(session.id)) {
      // Set the created timestamp to the event's date (first event timestamp)
      sessionManager.updateSessionState({ created: String(rawRumEvent.date) })
      sessionsWithCreatedTimestamp.add(session.id)
    }
  })

  hooks.register(HookNames.Assemble, ({ eventType, startTime }): DefaultRumEventAttributes | DISCARDED => {
    const session = sessionManager.findTrackedSession(startTime)
    const view = viewHistory.findView(startTime)

    if (!session || !view) {
      return DISCARDED
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

    // Get the created timestamp
    const createdTimestamp = session.created ? Number(session.created) : undefined

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
