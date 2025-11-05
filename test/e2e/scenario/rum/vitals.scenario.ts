import { test, expect } from '@playwright/test'
import { ExperimentalFeature } from '@motadata365/browser-core'
import { createTest } from '../../lib/framework'

test.describe('vital collection', () => {
  createTest('send custom duration vital')
    .withRum()
    .run(async ({ flushEvents, intakeRegistry, page }) => {
      await page.evaluate(() => {
        const vital = window.MD_RUM!.startDurationVital('foo')
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            window.MD_RUM!.stopDurationVital(vital)
            resolve()
          }, 5)
        })
      })
      await flushEvents()

      expect(intakeRegistry.rumVitalEvents).toHaveLength(1)
      expect(intakeRegistry.rumVitalEvents[0].vital.name).toEqual('foo')
      expect(intakeRegistry.rumVitalEvents[0].vital.duration).toEqual(expect.any(Number))
    })

  createTest('send operation step vital')
    .withRum({
      enableExperimentalFeatures: [ExperimentalFeature.FEATURE_OPERATION_VITAL],
    })
    .run(async ({ flushEvents, intakeRegistry, page }) => {
      await page.evaluate(() => {
        window.MD_RUM!.startFeatureOperation('foo')
      })
      await flushEvents()

      expect(intakeRegistry.rumVitalEvents).toHaveLength(1)
      expect(intakeRegistry.rumVitalEvents[0].vital.name).toEqual('foo')
      expect(intakeRegistry.rumVitalEvents[0].vital.step_type).toEqual('start')
    })
})
