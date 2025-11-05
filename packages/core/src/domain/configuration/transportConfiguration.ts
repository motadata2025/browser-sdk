import type { Site } from '../intakeSites'
import { INTAKE_URL_PARAMETERS } from '../intakeSites'
import type { InitConfiguration } from './configuration'
import type { EndpointBuilder } from './endpointBuilder'
import { createEndpointBuilder } from './endpointBuilder'

export interface TransportConfiguration {
  logsEndpointBuilder: EndpointBuilder
  rumEndpointBuilder: EndpointBuilder
  sessionReplayEndpointBuilder: EndpointBuilder
  profilingEndpointBuilder: EndpointBuilder
  exposuresEndpointBuilder: EndpointBuilder
  datacenter?: string | undefined
  replica?: ReplicaConfiguration
  site: Site
  source: 'browser' | 'flutter' | 'unity'
}

export interface ReplicaConfiguration {
  logsEndpointBuilder: EndpointBuilder
  rumEndpointBuilder: EndpointBuilder
}

export function computeTransportConfiguration(initConfiguration: InitConfiguration): TransportConfiguration {
  const site = initConfiguration.site || 'localhost'
  const source = validateSource(initConfiguration.source)

  const endpointBuilders = computeEndpointBuilders({ ...initConfiguration, site, source })
  const replicaConfiguration = computeReplicaConfiguration({ ...initConfiguration, site, source })

  return {
    replica: replicaConfiguration,
    site,
    source,
    ...endpointBuilders,
  }
}

function validateSource(source: string | undefined) {
  if (source === 'flutter' || source === 'unity') {
    return source
  }
  return 'browser'
}

function computeEndpointBuilders(initConfiguration: InitConfiguration) {
  return {
    logsEndpointBuilder: createEndpointBuilder(initConfiguration, 'logs'),
    rumEndpointBuilder: createEndpointBuilder(initConfiguration, 'rum'),
    profilingEndpointBuilder: createEndpointBuilder(initConfiguration, 'profile'),
    sessionReplayEndpointBuilder: createEndpointBuilder(initConfiguration, 'replay'),
    exposuresEndpointBuilder: createEndpointBuilder(initConfiguration, 'exposures'),
  }
}

function computeReplicaConfiguration(initConfiguration: InitConfiguration): ReplicaConfiguration | undefined {
  // Disable replica configuration for custom endpoints to avoid duplicate requests
  // The replica feature was designed for Datadog's internal use and causes unwanted duplicates
  // when using custom endpoints
  return undefined
}

export function isIntakeUrl(url: string): boolean {
  // check if tags is present in the query string
  return INTAKE_URL_PARAMETERS.every((param) => url.includes(param))
}
