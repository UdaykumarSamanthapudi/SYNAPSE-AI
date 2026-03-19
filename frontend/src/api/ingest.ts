import { parseJsonSafe } from './http'

export type IngestSuccess = {
  status: 'success'
  message: string
  filename: string
}

export type IngestFailure = {
  error: string
}

export async function postIngest(file: File): Promise<IngestSuccess> {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch('/ingest', {
    method: 'POST',
    body: form,
  })

  const data = (await parseJsonSafe(res)) as IngestSuccess | IngestFailure | null

  if (!res.ok) {
    const msg =
      (data && typeof (data as any).error === 'string' && (data as any).error) ||
      `Upload failed (${res.status})`
    throw new Error(msg)
  }

  if (!data || (data as any).status !== 'success') {
    const msg = (data && typeof (data as any).error === 'string' && (data as any).error) || 'Unexpected response from /ingest'
    throw new Error(msg)
  }

  return data as IngestSuccess
}

