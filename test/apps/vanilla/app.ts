import { motadataLogs } from '@motadata365/browser-logs'
import { motadataRum } from '@motadata365/browser-rum'

declare global {
  interface Window {
    LOGS_INIT?: () => void
    RUM_INIT?: () => void
  }
}

if (typeof window !== 'undefined') {
  if (window.LOGS_INIT) {
    window.LOGS_INIT()
  }

  if (window.RUM_INIT) {
    window.RUM_INIT()
  }
} else {
  // compat test
  motadataLogs.init({ clientToken: 'xxx', beforeSend: undefined })
  motadataRum.init({ clientToken: 'xxx', applicationId: 'xxx', beforeSend: undefined })
  motadataRum.setUser({ id: undefined })
}
