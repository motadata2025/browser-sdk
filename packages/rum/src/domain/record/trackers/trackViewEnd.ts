import { timeStampNow } from '@motadata365/browser-core'
import type { LifeCycle } from '@motadata365/browser-rum-core'
import { LifeCycleEventType } from '@motadata365/browser-rum-core'
import type { ViewEndRecord } from '../../../types'
import { RecordType } from '../../../types'
import type { Tracker } from './tracker.types'

export type ViewEndCallback = (record: ViewEndRecord) => void

export function trackViewEnd(lifeCycle: LifeCycle, viewEndCb: ViewEndCallback): Tracker {
  const viewEndSubscription = lifeCycle.subscribe(LifeCycleEventType.VIEW_ENDED, () => {
    viewEndCb({
      timestamp: timeStampNow(),
      type: RecordType.ViewEnd,
    })
  })

  return {
    stop: () => {
      viewEndSubscription.unsubscribe()
    },
  }
}
