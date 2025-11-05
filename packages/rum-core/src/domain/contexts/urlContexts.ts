import type { RelativeTime, Observable } from '@motadata365/browser-core'
import { SESSION_TIME_OUT_DELAY, relativeNow, createValueHistory, HookNames, DISCARDED, getPathName } from '@motadata365/browser-core'
import type { LocationChange } from '../../browser/locationChangeObservable'
import type { LifeCycle } from '../lifeCycle'
import { LifeCycleEventType } from '../lifeCycle'
import type { DefaultRumEventAttributes, Hooks } from '../hooks'

/**
 * We want to attach to an event:
 * - the url corresponding to its start
 * - the referrer corresponding to the previous view url (or document referrer for initial view)
 */

export const URL_CONTEXT_TIME_OUT_DELAY = SESSION_TIME_OUT_DELAY

// Regex to match path segments that contain numbers (mixed alphanumerics)
// This is the same regex used in SimpleUrlGroupingProcessor.java
const PATH_MIXED_ALPHANUMERICS = /\/(?![vV]\d{1,2}\/)([^/\d?]*\d+[^/?]*)/g

/**
 * Transforms a URL pathname by replacing numeric path segments with '?' symbols.
 * This helps group similar URLs together in analytics.
 *
 * @param pathname - The pathname to transform
 * @returns The transformed pathname with numeric segments replaced by '?'
 *
 * @example
 * transformPathName('/layer1/layer2') // => '/?/?'
 * transformPathName('/layer/layer2/dashboard') // => '/layer/?/dashboard'
 */
function transformPathName(pathname: string): string {
  if (!pathname) {
    return '/'
  }

  // Replace all the mixed alphanumerics with a ?
  return pathname.replace(PATH_MIXED_ALPHANUMERICS, '/?')
}

export interface UrlContext {
  url: string
  referrer: string
  name: string
}

export interface UrlContexts {
  findUrl: (startTime?: RelativeTime) => UrlContext | undefined
  stop: () => void
}

export function startUrlContexts(
  lifeCycle: LifeCycle,
  hooks: Hooks,
  locationChangeObservable: Observable<LocationChange>,
  location: Location
) {
  const urlContextHistory = createValueHistory<UrlContext>({ expireDelay: URL_CONTEXT_TIME_OUT_DELAY })

  let previousViewUrl: string | undefined

  lifeCycle.subscribe(LifeCycleEventType.BEFORE_VIEW_CREATED, ({ startClocks }) => {
    const viewUrl = location.href
    urlContextHistory.add(
      buildUrlContext({
        url: viewUrl,
        referrer: !previousViewUrl ? document.referrer : previousViewUrl,
      }),
      startClocks.relative
    )
    previousViewUrl = viewUrl
  })

  lifeCycle.subscribe(LifeCycleEventType.AFTER_VIEW_ENDED, ({ endClocks }) => {
    urlContextHistory.closeActive(endClocks.relative)
  })

  const locationChangeSubscription = locationChangeObservable.subscribe(({ newLocation }) => {
    const current = urlContextHistory.find()
    if (current) {
      const changeTime = relativeNow()
      urlContextHistory.closeActive(changeTime)
      urlContextHistory.add(
        buildUrlContext({
          url: newLocation.href,
          referrer: current.referrer,
        }),
        changeTime
      )
    }
  })

  function buildUrlContext({ url, referrer }: { url: string; referrer: string }) {
    return {
      url,
      referrer,
      name: transformPathName(getPathName(url)),
    }
  }

  hooks.register(HookNames.Assemble, ({ startTime, eventType }): DefaultRumEventAttributes | DISCARDED => {
    const urlContext = urlContextHistory.find(startTime)

    if (!urlContext) {
      return DISCARDED
    }

    return {
      type: eventType,
      view: {
        url: urlContext.url,
        referrer: urlContext.referrer,
        name: urlContext.name,
      },
    }
  })

  return {
    findUrl: (startTime?: RelativeTime) => urlContextHistory.find(startTime),
    stop: () => {
      locationChangeSubscription.unsubscribe()
      urlContextHistory.stop()
    },
  }
}
