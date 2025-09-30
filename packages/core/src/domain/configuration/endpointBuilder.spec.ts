import type { Payload } from '../../transport'
import type { InitConfiguration } from './configuration'
import { createEndpointBuilder } from './endpointBuilder'

const DEFAULT_PAYLOAD = {} as Payload

describe('endpointBuilder', () => {
  const clientToken = 'some_client_token'
  let initConfiguration: InitConfiguration

  beforeEach(() => {
    initConfiguration = { clientToken }
  })

  describe('query parameters', () => {
    it('should add intake query parameters', () => {
      expect(createEndpointBuilder(initConfiguration, 'rum').build('fetch', DEFAULT_PAYLOAD)).toMatch(
        `&md-api-key=${clientToken}&md-evp-origin-version=(.*)&md-evp-origin=browser&md-request-id=(.*)`
      )
    })

    it('should add batch_time for rum endpoint', () => {
      expect(createEndpointBuilder(initConfiguration, 'rum').build('fetch', DEFAULT_PAYLOAD)).toContain('&batch_time=')
    })

    it('should not add batch_time for logs and replay endpoints', () => {
      expect(createEndpointBuilder(initConfiguration, 'logs').build('fetch', DEFAULT_PAYLOAD)).not.toContain(
        '&batch_time='
      )
      expect(createEndpointBuilder(initConfiguration, 'replay').build('fetch', DEFAULT_PAYLOAD)).not.toContain(
        '&batch_time='
      )
    })

    it('should add the provided encoding', () => {
      expect(
        createEndpointBuilder(initConfiguration, 'rum').build('fetch', { ...DEFAULT_PAYLOAD, encoding: 'deflate' })
      ).toContain('&md-evp-encoding=deflate')
    })

    it('should not start with mdsource for internal analytics mode', () => {
      const url = createEndpointBuilder({ ...initConfiguration, internalAnalyticsSubdomain: 'foo' }, 'rum').build(
        'fetch',
        DEFAULT_PAYLOAD
      )
      expect(url).not.toContain('/rum?mdsource')
      expect(url).toContain('mdsource=browser')
    })

    it('accepts extra parameters', () => {
      const extraParameters = ['application.id=1234', 'application.version=1.0.0']
      const url = createEndpointBuilder(initConfiguration, 'rum', extraParameters).build('fetch', DEFAULT_PAYLOAD)
      expect(url).toContain('application.id=1234')
      expect(url).toContain('application.version=1.0.0')
    })
  })

  describe('proxy configuration', () => {
    it('should replace the intake endpoint by the proxy and set the intake path and parameters in the attribute mdforward', () => {
      expect(
        createEndpointBuilder({ ...initConfiguration, proxy: 'https://proxy.io/path' }, 'rum').build(
          'fetch',
          DEFAULT_PAYLOAD
        )
      ).toMatch(
        `https://proxy.io/path\\?mdforward=${encodeURIComponent(
          `/api/v2/rum?mdsource=(.*)&md-api-key=${clientToken}` +
            '&md-evp-origin-version=(.*)&md-evp-origin=browser&md-request-id=(.*)&batch_time=(.*)'
        )}`
      )
    })

    it('normalizes the proxy url', () => {
      const endpoint = createEndpointBuilder({ ...initConfiguration, proxy: '/path' }, 'rum').build(
        'fetch',
        DEFAULT_PAYLOAD
      )
      expect(endpoint.startsWith(`${location.origin}/path?mdforward`)).toBeTrue()
    })

    it('should allow to fully control the proxy url', () => {
      const proxyFn = (options: { path: string; parameters: string }) =>
        `https://proxy.io/prefix${options.path}/suffix?${options.parameters}`
      expect(
        createEndpointBuilder({ ...initConfiguration, proxy: proxyFn }, 'rum').build('fetch', DEFAULT_PAYLOAD)
      ).toMatch(
        `https://proxy.io/prefix/api/v2/rum/suffix\\?mdsource=(.*)&md-api-key=${clientToken}&md-evp-origin-version=(.*)&md-evp-origin=browser&md-request-id=(.*)&batch_time=(.*)`
      )
    })
  })

  describe('_md attributes', () => {
    it('should contain api', () => {
      expect(createEndpointBuilder(initConfiguration, 'rum').build('fetch', DEFAULT_PAYLOAD)).toContain('_md.api=fetch')
    })

    it('should contain retry infos', () => {
      expect(
        createEndpointBuilder(initConfiguration, 'rum').build('fetch', {
          ...DEFAULT_PAYLOAD,
          retry: {
            count: 5,
            lastFailureStatus: 408,
          },
        })
      ).toContain('_md.retry_count=5&_md.retry_after=408')
    })

    it('should not contain any _md attributes for non rum endpoints', () => {
      expect(
        createEndpointBuilder(initConfiguration, 'logs').build('fetch', {
          ...DEFAULT_PAYLOAD,
          retry: {
            count: 5,
            lastFailureStatus: 408,
          },
        })
      ).not.toContain('_md.api=fetch&_md.retry_count=5&_md.retry_after=408')
    })
  })

  describe('custom site configuration', () => {
    it('should use custom site directly', () => {
      const config: InitConfiguration = {
        clientToken,
        site: 'localhost:3000',
      }
      expect(createEndpointBuilder(config, 'rum').build('fetch', DEFAULT_PAYLOAD)).toContain(
        'https://localhost:3000/api/v2/rum'
      )
    })

    it('should use custom site with port', () => {
      const config: InitConfiguration = {
        clientToken,
        site: 'my-custom-domain.com:8080',
      }
      expect(createEndpointBuilder(config, 'logs').build('fetch', DEFAULT_PAYLOAD)).toContain(
        'https://my-custom-domain.com:8080/api/v2/logs'
      )
    })

    it('should use custom site without port (defaults to 443 for https)', () => {
      const config: InitConfiguration = {
        clientToken,
        site: 'my-custom-domain.com',
      }
      expect(createEndpointBuilder(config, 'rum').build('fetch', DEFAULT_PAYLOAD)).toContain(
        'https://my-custom-domain.com/api/v2/rum'
      )
    })
  })

  describe('source configuration', () => {
    it('should use the default source when no configuration is provided', () => {
      const endpoint = createEndpointBuilder(initConfiguration, 'rum').build('fetch', DEFAULT_PAYLOAD)
      expect(endpoint).toContain('mdsource=browser')
    })

    it('should use flutter source when provided', () => {
      const config = { ...initConfiguration, source: 'flutter' as const }
      const endpoint = createEndpointBuilder(config, 'rum').build('fetch', DEFAULT_PAYLOAD)
      expect(endpoint).toContain('mdsource=flutter')
    })

    it('should use unity source when provided', () => {
      const config = { ...initConfiguration, source: 'unity' as const }
      const endpoint = createEndpointBuilder(config, 'rum').build('fetch', DEFAULT_PAYLOAD)
      expect(endpoint).toContain('mdsource=unity')
    })
  })
})
