import type { ClocksState } from '@datadog/browser-core'
import type { RumConfiguration, RumSession } from '@datadog/browser-rum-core'

import { getSessionReplayUrl, getDatadogSiteUrl } from './getSessionReplayUrl'

describe('getDatadogSiteUrl', () => {
  const parameters: Array<[string, string | undefined, string]> = [
    ['192.168.1.100:8080', undefined, '192.168.1.100:8080'],
    ['192.168.1.100:8080', 'app', 'app.192.168.1.100:8080'],
    ['10.0.0.1', undefined, '10.0.0.1'],
    ['10.0.0.1', 'app', 'app.10.0.0.1'],
    ['localhost:3000', undefined, 'localhost:3000'],
    ['localhost:3000', 'app', 'app.localhost:3000'],
    ['example.com', undefined, 'example.com'],
    ['example.com', 'app', 'app.example.com'],
  ]

  parameters.forEach(([site, subdomain, host]) => {
    it(`should return ${host} for subdomain "${
      subdomain ?? 'undefined'
    }" on "${site}"`, () => {
      const link = getDatadogSiteUrl({ site, subdomain } as RumConfiguration)

      expect(link).toBe(`https://${host}`)
    })
  })

  it('should use default site when site is not provided', () => {
    const link = getDatadogSiteUrl({} as RumConfiguration)
    expect(link).toBe('https://127.0.0.1:3000')
  })
})

describe('getSessionReplayUrl', () => {
  const parameters = [
    [
      {
        testCase: 'session, no view, no error',
        session: { id: 'session-id-1' } as RumSession,
        viewContext: undefined,
        errorType: undefined,
        expected: 'https://127.0.0.1:3000/rum/replay/sessions/session-id-1?',
      },
    ],
    [
      {
        testCase: 'no session, no view, error',
        session: undefined,
        viewContext: undefined,
        errorType: 'toto',
        expected: 'https://127.0.0.1:3000/rum/replay/sessions/no-session-id?error-type=toto',
      },
    ],
    [
      {
        testCase: 'session, view, no error',
        session: { id: 'session-id-2' } as RumSession,
        viewContext: { id: 'view-id-1', startClocks: { relative: 0, timeStamp: 1234 } as ClocksState },
        errorType: undefined,
        expected: 'https://127.0.0.1:3000/rum/replay/sessions/session-id-2?seed=view-id-1&from=1234',
      },
    ],
    [
      {
        testCase: 'session, view, error',
        session: { id: 'session-id-3' } as RumSession,
        viewContext: { id: 'view-id-2', startClocks: { relative: 0, timeStamp: 1234 } as ClocksState },
        errorType: 'titi',
        expected: 'https://127.0.0.1:3000/rum/replay/sessions/session-id-3?error-type=titi&seed=view-id-2&from=1234',
      },
    ],
  ]

  parameters.forEach(([{ testCase, session, viewContext, errorType, expected }]) => {
    it(`should build url when ${testCase}`, () => {
      const link = getSessionReplayUrl({ site: '127.0.0.1:3000' } as RumConfiguration, {
        viewContext,
        session,
        errorType,
      })
      expect(link).toBe(expected)
    })
  })
})
