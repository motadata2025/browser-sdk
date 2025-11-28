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
 * Returns one of: Chrome, Firefox, Edge, Opera, Safari, other
 */
let detailedBrowserNameCache: string | undefined
export function getDetailedBrowserName(browserWindow: Window = window): string {
  return detailedBrowserNameCache ?? (detailedBrowserNameCache = detectDetailedBrowserName(browserWindow))
}

// Exported only for tests
export function detectDetailedBrowserName(browserWindow: Window = window): string {
  // Try Client Hints API first for more accurate detection
  const clientHintsBrowser = parseClientHints(browserWindow)
  if (clientHintsBrowser) {
    return clientHintsBrowser
  }

  // Fallback to user agent parsing
  return parseUserAgent(browserWindow)
}

function parseClientHints(browserWindow: Window = window): string {
  try {
    const uaData = (browserWindow.navigator as any).userAgentData

    if (uaData && Array.isArray(uaData.brands)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      const brands = uaData.brands.map(b => b.brand.toLowerCase())

      // Brave check: Brave hides itself, detect by missing Google Chrome
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const isBrave = !brands.includes('google chrome') && brands.includes('chromium')
      if (isBrave) {
        return 'other'
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      if (brands.includes('microsoft edge')) {return 'Edge'}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      if (brands.includes('opera') || brands.includes('opr')) {return 'Opera'}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      if (brands.includes('google chrome') || brands.includes('chrome')) {return 'Chrome'}

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      if (brands.includes('chromium')) {return 'other'}
    }
  } catch (_) { /* empty */ }

  // fallback to userAgent
  const ua = browserWindow.navigator.userAgent

  if (/edg/i.test(ua)) {
    return 'Edge';
  }
  if (/opr|opera/i.test(ua)) {return 'Opera'}
  if (/chrome/i.test(ua)) {return 'Chrome'}
  if (/safari/i.test(ua)) {return 'Safari'}
  if (/firefox/i.test(ua)) {return 'Firefox'}

  return 'other'
}

function parseUserAgent(browserWindow: Window = window): string {
  const userAgent = browserWindow.navigator.userAgent

  // Firefox detection
  if (/Firefox\//i.test(userAgent)) {
    return 'Firefox'
  }

  // Safari detection (must come before Chrome check)
  if (
    (browserWindow.navigator.vendor?.indexOf('Apple') === 0 ||
      (/safari/i.test(userAgent) && !/chrome|android/i.test(userAgent)))
  ) {
    return 'Safari'
  }

  // Chrome-based browsers detection
  if (/Chrome\//i.test(userAgent) || (browserWindow as any).chrome || /HeadlessChrome/.test(userAgent)) {
    // Edge detection
    if (/Edg\//i.test(userAgent)) {
      return 'Edge'
    }

    // Opera detection
    if (/OPR\//i.test(userAgent) || /Opera\//i.test(userAgent)) {
      return 'Opera'
    }

    // Brave detection (fallback - Brave shows as Chrome in user agent)
    // Note: This is less reliable than Client Hints, but better than nothing
    if (/Brave\//i.test(userAgent)) {
      return 'other'
    }

    // Default Chrome detection
    return 'Chrome'
  }

  // All other browsers
  return 'other'
}
