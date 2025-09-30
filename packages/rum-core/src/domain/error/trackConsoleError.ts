import type { Observable, RawError } from '@motadata365/browser-core'
import { initConsoleObservable, ConsoleApiName } from '@motadata365/browser-core'

export function trackConsoleError(errorObservable: Observable<RawError>) {
  const subscription = initConsoleObservable([ConsoleApiName.error]).subscribe((consoleLog) =>
    errorObservable.notify(consoleLog.error)
  )

  return {
    stop: () => {
      subscription.unsubscribe()
    },
  }
}
