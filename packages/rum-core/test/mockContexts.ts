import { noop, getPathName } from '@motadata365/browser-core'
import type { UrlContexts } from '../src/domain/contexts/urlContexts'
import type { ViewHistory, ViewHistoryEntry } from '../src/domain/contexts/viewHistory'

// Regex to match path segments that contain numbers (mixed alphanumerics)
const PATH_MIXED_ALPHANUMERICS = /\/(?![vV]\d{1,2}\/)([^/\d?]*\d+[^/?]*)/g

function transformPathName(pathname: string): string {
  if (!pathname) {
    return '/'
  }
  return pathname.replace(PATH_MIXED_ALPHANUMERICS, '/?')
}

export function mockUrlContexts(fakeLocation: Location = location): UrlContexts {
  return {
    findUrl: () => ({
      url: fakeLocation.href,
      referrer: document.referrer,
      name: transformPathName(getPathName(fakeLocation.href)),
    }),
    stop: noop,
  }
}

export function mockViewHistory(view?: Partial<ViewHistoryEntry>): ViewHistory {
  return {
    findView: () => view as ViewHistoryEntry,
    stop: noop,
  }
}
