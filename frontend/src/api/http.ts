export type ApiError = {
  message: string
  status?: number
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'


export async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export function toApiError(e: unknown): ApiError {
  if (typeof e === 'object' && e && 'message' in e && typeof (e as any).message === 'string') {
    return { message: (e as any).message }
  }
  return { message: 'Request failed' }
}

