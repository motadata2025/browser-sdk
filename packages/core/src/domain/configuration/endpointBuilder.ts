import type { Payload } from '../../transport'
import { timeStampNow } from '../../tools/utils/timeUtils'
import { normalizeUrl } from '../../tools/utils/urlPolyfill'
import { generateUUID } from '../../tools/utils/stringUtils'
import { DEFAULT_SITE } from '../intakeSites'
import type { InitConfiguration } from './configuration'

// replaced at build time
declare const __BUILD_ENV__SDK_VERSION__: string

export type TrackType = 'logs' | 'rum' | 'replay' | 'profile' | 'exposures'
export type ApiType =
  | 'fetch-keepalive'
  | 'fetch'
  | 'beacon'
  // 'manual' reflects that the request have been sent manually, outside of the SDK (ex: via curl or
  // a Node.js script).
  | 'manual'

export type EndpointBuilder = ReturnType<typeof createEndpointBuilder>

export function createEndpointBuilder(
  initConfiguration: InitConfiguration,
  trackType: TrackType,
  extraParameters?: string[]
) {
  const buildUrlWithParameters = createEndpointUrlWithParametersBuilder(initConfiguration, trackType)

  return {
    build(api: ApiType, payload: Payload) {
      const parameters = buildEndpointParameters(initConfiguration, trackType, api, payload, extraParameters)
      return buildUrlWithParameters(parameters)
    },
    trackType,
  }
}

/**
 * Create a function used to build a full endpoint url from provided parameters. The goal of this
 * function is to pre-compute some parts of the URL to avoid re-computing everything on every
 * request, as only parameters are changing.
 */
function createEndpointUrlWithParametersBuilder(
  initConfiguration: InitConfiguration,
  trackType: TrackType
): (parameters: string) => string {
  const path = `/api/v2/${trackType}`
  const proxy = initConfiguration.proxy
  if (typeof proxy === 'string') {
    const normalizedProxyUrl = normalizeUrl(proxy)
    return (parameters) => `${normalizedProxyUrl}?ddforward=${encodeURIComponent(`${path}?${parameters}`)}`
  }
  if (typeof proxy === 'function') {
    return (parameters) => proxy({ path, parameters })
  }
  const host = buildEndpointHost(trackType, initConfiguration)
  return (parameters) => `https://${host}${path}?${parameters}`
}

export function buildEndpointHost(
  trackType: TrackType,
  initConfiguration: InitConfiguration & { usePciIntake?: boolean }
) {
  const { site = DEFAULT_SITE, internalAnalyticsSubdomain } = initConfiguration

  // For custom sites, use them directly
  // If the site contains a port, it will be preserved
  // If no port is specified, HTTPS will use port 443 by default
  if (internalAnalyticsSubdomain) {
    // Check if site already has a port
    const hasPort = site.includes(':')
    if (hasPort) {
      const [hostname, port] = site.split(':')
      return `${internalAnalyticsSubdomain}.${hostname}:${port}`
    } else {
      return `${internalAnalyticsSubdomain}.${site}`
    }
  }

  // Return the site as-is for flexible endpoint configuration
  return site
}

/**
 * Build parameters to be used for an intake request. Parameters should be re-built for each
 * request, as they change randomly.
 */
function buildEndpointParameters(
  { clientToken, internalAnalyticsSubdomain, source = 'browser' }: InitConfiguration,
  trackType: TrackType,
  api: ApiType,
  { retry, encoding }: Payload,
  extraParameters: string[] = []
) {
  const parameters = [
    `ddsource=${source}`,
    `dd-api-key=${clientToken}`,
    `dd-evp-origin-version=${encodeURIComponent(__BUILD_ENV__SDK_VERSION__)}`,
    'dd-evp-origin=browser',
    `dd-request-id=${generateUUID()}`,
  ].concat(extraParameters)

  if (encoding) {
    parameters.push(`dd-evp-encoding=${encoding}`)
  }

  if (trackType === 'rum') {
    parameters.push(`batch_time=${timeStampNow()}`, `_dd.api=${api}`)

    if (retry) {
      parameters.push(`_dd.retry_count=${retry.count}`, `_dd.retry_after=${retry.lastFailureStatus}`)
    }
  }

  if (internalAnalyticsSubdomain) {
    parameters.reverse()
  }

  return parameters.join('&')
}
