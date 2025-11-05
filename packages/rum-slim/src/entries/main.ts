// Keep the following in sync with packages/rum/src/entries/main.ts
import { defineGlobal, getGlobalObject } from '@motadata365/browser-core'
import type { RumPublicApi } from '@motadata365/browser-rum-core'
import { makeRumPublicApi, startRum } from '@motadata365/browser-rum-core'
import { makeRecorderApiStub } from '../boot/stubRecorderApi'
import { makeProfilerApiStub } from '../boot/stubProfilerApi'

export type {
  User,
  Account,
  TraceContextInjection,
  SessionPersistence,
  TrackingConsent,
  MatchOption,
  ProxyFn,
  Site,
  Context,
  ContextValue,
  ContextArray,
  RumInternalContext,
} from '@motadata365/browser-core'

/**
 * @deprecated Use {@link MotadataRum} instead
 */
export type RumGlobal = RumPublicApi

export type {
  RumPublicApi as MotadataRum,
  RumInitConfiguration,
  ViewOptions,
  StartRecordingOptions,
  AddDurationVitalOptions,
  DurationVitalOptions,
  DurationVitalReference,
  TracingOption,
  RumPlugin,
  OnRumStartOptions,
  PropagatorType,
  FeatureFlagsForEvents,

  // Events
  CommonProperties,
  RumEvent,
  RumActionEvent,
  RumErrorEvent,
  RumLongTaskEvent,
  RumResourceEvent,
  RumViewEvent,
  RumVitalEvent,

  // Events context
  RumEventDomainContext,
  RumViewEventDomainContext,
  RumErrorEventDomainContext,
  RumActionEventDomainContext,
  RumVitalEventDomainContext,
  RumFetchResourceEventDomainContext,
  RumXhrResourceEventDomainContext,
  RumOtherResourceEventDomainContext,
  RumLongTaskEventDomainContext,
} from '@motadata365/browser-rum-core'
export { DefaultPrivacyLevel } from '@motadata365/browser-core'

/**
 * The global RUM instance. Use this to call RUM methods.
 *
 * @category Main
 * @see {@link MotadataRum}
 * @see [RUM Browser Monitoring Setup](https://docs.datadoghq.com/real_user_monitoring/browser/)
 */
export const motadataRum = makeRumPublicApi(startRum, makeRecorderApiStub(), makeProfilerApiStub(), {
  sdkName: 'rum-slim',
})

interface BrowserWindow extends Window {
  MD_RUM?: RumPublicApi
}
defineGlobal(getGlobalObject<BrowserWindow>(), 'MD_RUM', motadataRum)
