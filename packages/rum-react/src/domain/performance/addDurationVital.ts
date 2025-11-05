import type { RumPublicApi } from '@motadata365/browser-rum-core'
import { onRumInit } from '../reactPlugin'

export const addDurationVital: RumPublicApi['addDurationVital'] = (name, options) => {
  onRumInit((_, rumPublicApi) => {
    rumPublicApi.addDurationVital(name, options)
  })
}
