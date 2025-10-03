import type { RumConfiguration } from '@datadog/browser-rum-core'
import { getSessionReplayLink } from './getSessionReplayLink'

const DEFAULT_CONFIGURATION = {
  site: '127.0.0.1:3000',
} as RumConfiguration

describe('getReplayLink (slim package)', () => {
  it('should return the replay link with a "slim-package" error type', () => {
    const link = getSessionReplayLink(DEFAULT_CONFIGURATION)

    expect(link).toBe('https://127.0.0.1:3000/rum/replay/sessions/no-session-id?error-type=slim-package')
  })
})
