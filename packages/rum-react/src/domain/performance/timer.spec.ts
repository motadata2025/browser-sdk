import { mockClock } from '@motadata365/browser-core/test'
import type { Duration } from '@motadata365/browser-core'
import { createTimer } from './timer'

describe('createTimer', () => {
  it('is able to measure time', () => {
    const clock = mockClock()

    const timer = createTimer()
    timer.startTimer()
    clock.tick(1000)
    timer.stopTimer()
    expect(timer.getDuration()).toBe(1000 as Duration)
  })
})
