import { useCallback, useRef, useState } from 'react'
import { postIngest } from '../api/ingest'

type DocumentUploaderProps = {
  onUploaded?: (info: { filename: string; message: string }) => void
}

function isAllowed(file: File) {
  const name = file.name.toLowerCase()
  return name.endsWith('.pdf') || name.endsWith('.txt')
}

export function DocumentUploader(props: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const upload = useCallback(
    async (file: File) => {
      setError(null)
      setSuccess(null)
      if (!isAllowed(file)) {
        setError('Only .pdf and .txt files are supported.')
        return
      }
      setIsUploading(true)
      try {
        const res = await postIngest(file)
        setSuccess(res.message)
        props.onUploaded?.({ filename: res.filename, message: res.message })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed')
      } finally {
        setIsUploading(false)
      }
    },
    [props],
  )

  return (
    <div className="doc-uploader">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '1rem' }}>📄</span>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '0.83rem',
              color: '#e2e8f0',
            }}>
              Upload Document (RAG)
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(100,116,139,0.8)', lineHeight: 1.5 }}>
            Upload a PDF or TXT, then ask: <em style={{ color: '#a78bfa' }}>"search my documents about…"</em>
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="send-btn"
          style={{ fontSize: '0.72rem', padding: '0.45rem 1rem' }}
        >
          Choose File
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void upload(file)
            e.currentTarget.value = ''
          }}
        />
      </div>

      {/* Drop zone */}
      <div
        style={{
          marginTop: 12,
          borderRadius: 12,
          border: `1px dashed ${isDragging ? 'rgba(139,92,246,0.5)' : 'rgba(139,92,246,0.2)'}`,
          padding: '1rem',
          textAlign: 'center',
          background: isDragging ? 'rgba(139,92,246,0.08)' : 'transparent',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsDragging(false)
          const file = e.dataTransfer.files?.[0]
          if (file) void upload(file)
        }}
        role="button"
        tabIndex={0}
      >
        <p style={{ fontSize: '0.82rem', color: isUploading ? '#a78bfa' : 'rgba(100,116,139,0.7)', fontFamily: 'Inter, sans-serif' }}>
          {isUploading ? '⏳ Uploading…' : '⬆ Drag & drop PDF/TXT here or click to browse'}
        </p>
      </div>

      {error && (
        <div className="error-banner" style={{ marginTop: 8 }}>⚠ {error}</div>
      )}

      {success && (
        <div style={{
          marginTop: 8,
          padding: '0.6rem 1rem',
          background: 'rgba(74,222,128,0.08)',
          border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: 10,
          fontSize: '0.78rem',
          color: '#86efac',
        }}>
          ✓ {success}
        </div>
      )}
    </div>
  )
}
