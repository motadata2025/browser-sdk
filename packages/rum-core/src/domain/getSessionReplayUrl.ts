
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
  const site = rumConfiguration.site
  const subdomain = rumConfiguration.subdomain
  return `https://${subdomain ? `${subdomain}.` : ''}${site}`
}
