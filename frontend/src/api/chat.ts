import { parseJsonSafe } from './http'

export type ChatRequest = {
  session_id: string
  message: string
  db_url?: string | null
}

export type ChatSuccess = {
  response: string
}

export type ChatFailure = {
  error: string
}

export async function postChat(payload: ChatRequest): Promise<ChatSuccess> {
  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = (await parseJsonSafe(res)) as ChatSuccess | ChatFailure | null

  if (!res.ok) {
    const msg =
      (data && typeof (data as any).error === 'string' && (data as any).error) ||
      `Request failed (${res.status})`
    throw new Error(msg)
  }

  if (!data || typeof (data as any).response !== 'string') {
    throw new Error('Unexpected response from /chat')
  }

  return data as ChatSuccess
}

