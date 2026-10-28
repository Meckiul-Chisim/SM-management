// Creates a unique id for a new record.
//
// crypto.randomUUID() only exists on secure pages (https or localhost). Opening the
// dev server from a phone over plain http would crash without a fallback.
export function createId() {
  const webCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (webCrypto && typeof webCrypto.randomUUID === 'function') return webCrypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 6)}`
}
