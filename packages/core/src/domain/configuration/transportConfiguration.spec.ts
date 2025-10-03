import { DEFAULT_SITE } from '../intakeSites'
import type { Payload } from '../../transport'
import { computeTransportConfiguration, isIntakeUrl } from './transportConfiguration'

const DEFAULT_PAYLOAD = {} as Payload

describe('transportConfiguration', () => {
  const clientToken = 'some_client_token'
  const internalAnalyticsSubdomain = 'ia-rum-intake'
  const intakeParameters = 'ddsource=browser&dd-api-key=xxxx&dd-request-id=1234567890'

  describe('site', () => {
    it('should use default site when none provided', () => {
      const configuration = computeTransportConfiguration({ clientToken })
      expect(configuration.rumEndpointBuilder.build('fetch', DEFAULT_PAYLOAD)).toContain('127.0.0.1:3000')
      expect(configuration.site).toBe('127.0.0.1:3000')
    })

    it('should use custom site when provided', () => {
      const configuration = computeTransportConfiguration({ clientToken, site: 'example.com:8080' })
      expect(configuration.rumEndpointBuilder.build('fetch', DEFAULT_PAYLOAD)).toContain('example.com:8080')
      expect(configuration.site).toBe('example.com:8080')
    })

    it('should use site value when set', () => {
      const configuration = computeTransportConfiguration({ clientToken, site: '192.168.1.100:8080' })
      expect(configuration.rumEndpointBuilder.build('fetch', DEFAULT_PAYLOAD)).toContain('192.168.1.100:8080')
      expect(configuration.site).toBe('192.168.1.100:8080')
    })
  })

  describe('internalAnalyticsSubdomain', () => {
    it('should use internal analytics subdomain value when set', () => {
      const configuration = computeTransportConfiguration({
        clientToken,
        site: '192.168.1.100:3000',
        internalAnalyticsSubdomain,
      })
      expect(configuration.rumEndpointBuilder.build('fetch', DEFAULT_PAYLOAD)).toContain(internalAnalyticsSubdomain)
      expect(configuration.rumEndpointBuilder.build('fetch', DEFAULT_PAYLOAD)).toContain('192.168.1.100:3000')
    })

    it('should handle subdomain with IP and port', () => {
      const configuration = computeTransportConfiguration({
        clientToken,
        site: '10.0.0.1:8080',
        internalAnalyticsSubdomain: 'analytics',
      })
      expect(configuration.rumEndpointBuilder.build('fetch', DEFAULT_PAYLOAD)).toContain('analytics.10.0.0.1:8080')
    })
  })

  it('adds the replica application id to the rum replica endpoint', () => {
    const replicaApplicationId = 'replica-application-id'
    const configuration = computeTransportConfiguration({
      clientToken,
      replica: {
        clientToken: 'replica-client-token',
        applicationId: replicaApplicationId,
      },
    })
    expect(configuration.replica!.rumEndpointBuilder.build('fetch', DEFAULT_PAYLOAD)).toContain(
      `application.id=${replicaApplicationId}`
    )
  })

  describe('isIntakeUrl', () => {
    it('should detect intake request with required parameters', () => {
      expect(isIntakeUrl(`https://127.0.0.1:3000/api/v2/rum?${intakeParameters}`)).toBe(true)
      expect(isIntakeUrl(`https://192.168.1.100:8080/api/v2/logs?${intakeParameters}`)).toBe(true)
      expect(isIntakeUrl(`https://example.com/api/v2/replay?${intakeParameters}`)).toBe(true)
    })

    it('should not detect non intake request', () => {
      expect(isIntakeUrl('https://www.foo.com')).toBe(false)
      expect(isIntakeUrl('https://127.0.0.1:3000/api/v2/rum')).toBe(false) // missing parameters
    })

    describe('proxy configuration', () => {
      it('should detect proxy intake request', () => {
        expect(
          isIntakeUrl(`https://www.proxy.com/?ddforward=${encodeURIComponent(`/api/v2/rum?${intakeParameters}`)}`)
        ).toBe(true)
        expect(
          isIntakeUrl(
            `https://www.proxy.com/custom/path?ddforward=${encodeURIComponent(`/api/v2/rum?${intakeParameters}`)}`
          )
        ).toBe(true)
      })

      it('should not detect request done on the same host as the proxy', () => {
        expect(isIntakeUrl('https://www.proxy.com/foo')).toBe(false)
      })
    })
  })
})
