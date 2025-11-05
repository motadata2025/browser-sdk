import { DOM_EVENT, addEventListeners, timeStampNow } from '@motadata365/browser-core'
import type { RumConfiguration } from '@motadata365/browser-rum-core'
import type { FocusRecord } from '../../../types'
import { RecordType } from '../../../types'
import type { Tracker } from './tracker.types'

export type FocusCallback = (data: FocusRecord) => void

export function trackFocus(configuration: RumConfiguration, focusCb: FocusCallback): Tracker {
  return addEventListeners(configuration, window, [DOM_EVENT.FOCUS, DOM_EVENT.BLUR], () => {
    focusCb({
      data: { has_focus: document.hasFocus() },
      type: RecordType.Focus,
      timestamp: timeStampNow(),
    })
  })
}
