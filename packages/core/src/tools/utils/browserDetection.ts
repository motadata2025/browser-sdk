// eslint-disable-next-line import/no-extraneous-dependencies, local-rules/disallow-side-effects, local-rules/enforce-prod-deps-imports
import { UAParser } from 'ua-parser-js';

// Exported only for tests
export const enum Browser {
  CHROMIUM,
  SAFARI,
  OTHER,
}

export function isChromium() {
  return detectBrowserCached() === Browser.CHROMIUM
}

export function isSafari() {
  return detectBrowserCached() === Browser.SAFARI
}

let browserCache: Browser | undefined
function detectBrowserCached() {
  return browserCache ?? (browserCache = detectBrowser())
}

// Exported only for tests
export function detectBrowser(browserWindow: Window = window) {
  const userAgent = browserWindow.navigator.userAgent
  if ((browserWindow as any).chrome || /HeadlessChrome/.test(userAgent)) {
    return Browser.CHROMIUM
  }

  if (
    // navigator.vendor is deprecated, but it is the most resilient way we found to detect
    // "Apple maintained browsers" (AKA Safari). If one day it gets removed, we still have the
    // useragent test as a semi-working fallback.
    browserWindow.navigator.vendor?.indexOf('Apple') === 0 ||
    (/safari/i.test(userAgent) && !/chrome|android/i.test(userAgent))
  ) {
    return Browser.SAFARI
  }

  return Browser.OTHER
}

/**
 * Get detailed browser name for X-Browser-Name header
 * Uses ua-parser-js for accurate browser detection
 */
let detailedBrowserNameCache: string | undefined

export function getDetailedBrowserName(browserWindow: Window = window): string {
  return (
    detailedBrowserNameCache ??
    (detailedBrowserNameCache = detectDetailedBrowserName(browserWindow))
  )
}

export function detectDetailedBrowserName(browserWindow: Window = window): string {
  const ua = browserWindow.navigator.userAgent
  const parser = new UAParser(ua)
  const result = parser.getResult()

  // Return the browser name from ua-parser-js
  // If browser name is undefined or empty, return 'Unknown Browser'
  return result.browser.name || 'Unknown Browser'
}