import { elapsed, timeStampNow } from '@motadata365/browser-core'
import type { RumConfiguration } from '@motadata365/browser-rum-core'
import type { SerializedNodeWithId } from '../../../types'
import type { SerializationContext } from './serialization.types'
import { serializeNodeWithId } from './serializeNode'
import { updateSerializationStats } from './serializationStats'

export function serializeDocument(
  document: Document,
  configuration: RumConfiguration,
  serializationContext: SerializationContext
): SerializedNodeWithId {
  const serializationStart = timeStampNow()
  const serializedNode = serializeNodeWithId(document, {
    serializationContext,
    parentNodePrivacyLevel: configuration.defaultPrivacyLevel,
    configuration,
  })
  updateSerializationStats(
    serializationContext.serializationStats,
    'serializationDuration',
    elapsed(serializationStart, timeStampNow())
  )

  // We are sure that Documents are never ignored, so this function never returns null
  return serializedNode!
}
