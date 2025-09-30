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

export type {
  RumPublicApi as RumGlobal,
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

export const motadataRum = makeRumPublicApi(startRum, makeRecorderApiStub(), makeProfilerApiStub(), {
  sdkName: 'rum-slim',
})

interface BrowserWindow extends Window {
  MD_RUM?: RumPublicApi
}
defineGlobal(getGlobalObject<BrowserWindow>(), 'MD_RUM', motadataRum)
