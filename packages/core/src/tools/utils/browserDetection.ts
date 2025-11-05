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

function parseClientHints(browserWindow: Window = window): string | null {
  try {
    const userAgentData = (browserWindow.navigator as any).userAgentData
    if (userAgentData && userAgentData.brands) {
      const brands = userAgentData.brands as Array<{ brand: string; version: string }>

      // Check for Brave first - should be categorized as "other"
      const braveBrand = brands.find((brand) => brand.brand === 'Brave')
      if (braveBrand) {
        return 'other'
      }

      // Check for specific browsers in priority order
      const edgeBrand = brands.find((brand) => brand.brand === 'Microsoft Edge')
      if (edgeBrand) {
        return 'Edge'
      }

      const operaBrand = brands.find((brand) => brand.brand === 'Opera')
      if (operaBrand) {
        return 'Opera'
      }

      const chromeBrand = brands.find((brand) => brand.brand === 'Google Chrome')
      if (chromeBrand) {
        return 'Chrome'
      }

      // Other Chromium-based browsers should be categorized as "other"
      const chromiumBrand = brands.find((brand) => brand.brand === 'Chromium')
      if (chromiumBrand) {
        return 'other'
      }
    }
  } catch (error) {
    // Silently fail if Client Hints are not available
  }
  return null
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
