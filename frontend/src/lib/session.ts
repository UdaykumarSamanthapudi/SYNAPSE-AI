const KEY = 'synapse.session_id'

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID()
  }
  return `session_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(KEY)
    if (existing) return existing
    const created = randomId()
    localStorage.setItem(KEY, created)
    return created
  } catch {
    return randomId()
  }
}

export function resetSessionId(): string {
  const created = randomId()
  try {
    localStorage.setItem(KEY, created)
  } catch {
    // ignore
  }
  return created
}

