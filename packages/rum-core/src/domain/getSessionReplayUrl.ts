import { DEFAULT_SITE } from '@datadog/browser-core'
import type { RumConfiguration } from './configuration'
import type { ViewHistoryEntry } from './contexts/viewHistory'
import type { RumSession } from './rumSessionManager'

export function getSessionReplayUrl(
  configuration: RumConfiguration,
  {
    session,
    viewContext,
    errorType,
  }: {
    session?: RumSession
    viewContext?: ViewHistoryEntry
    errorType?: string
  }
): string {
  const sessionId = session ? session.id : 'no-session-id'
  const parameters: string[] = []
  if (errorType !== undefined) {
    parameters.push(`error-type=${errorType}`)
  }
  if (viewContext) {
    parameters.push(`seed=${viewContext.id}`)
    parameters.push(`from=${viewContext.startClocks.timeStamp}`)
  }

  const origin = getDatadogSiteUrl(configuration)
  const path = `/rum/replay/sessions/${sessionId}`
  return `${origin}${path}?${parameters.join('&')}`
}

export function getDatadogSiteUrl(rumConfiguration: RumConfiguration) {
  const site = rumConfiguration.site || DEFAULT_SITE
  const subdomain = rumConfiguration.subdomain

  // For custom sites, use them directly with optional subdomain
  if (subdomain) {
    // Check if site already has a port
    const hasPort = site.includes(':')
    if (hasPort) {
      const [hostname, port] = site.split(':')
      return `https://${subdomain}.${hostname}:${port}`
    } else {
      return `https://${subdomain}.${site}`
    }
  }

  // Return the site as-is for flexible configuration
  // Port 443 will be used by default for HTTPS if no port is specified
  return `https://${site}`
}
