import type { LogsGlobal } from '@motadata365/browser-logs'
import type { RumGlobal } from '@motadata365/browser-rum'

declare global {
  interface Window {
    MD_LOGS?: LogsGlobal
    MD_RUM?: RumGlobal
  }
}
