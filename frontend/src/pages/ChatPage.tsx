import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { postChat } from '../api/chat'
import { DocumentUploader } from '../components/DocumentUploader'
import { HowToUsePanel } from '../components/HowToUsePanel'
import { getOrCreateSessionId, resetSessionId } from '../lib/session'
import type { ChatMessage } from '../types/chat'

export function ChatPage() {
  const location = useLocation()
  const [guideOpen, setGuideOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [dbUrl, setDbUrl] = useState('')
  const [sessionId, setSessionId] = useState(() => getOrCreateSessionId())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const openGuideFromWelcome = useMemo(() => {
    const state = location.state as { openGuide?: boolean } | null
    return Boolean(state?.openGuide)
  }, [location.state])

  useEffect(() => {
    if (openGuideFromWelcome) setGuideOpen(true)
  }, [openGuideFromWelcome])

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  /* Auto-resize textarea */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }, [draft])

  async function onSend() {
    const text = draft.trim()
    if (!text || isSending) return

    setSendError(null)
    setIsSending(true)

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setDraft('')

    try {
      const res = await postChat({
        session_id: sessionId,
        message: text,
        db_url: dbUrl.trim() ? dbUrl.trim() : null,
      })

      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: res.response,
        createdAt: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send'
      setSendError(msg)
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void onSend()
    }
  }

  const charCount = draft.length

  return (
    <div className="synapse-chat-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background glow */}
      <div className="chat-bg-glow" />

      {/* Top bar */}
      <header className="synapse-topbar">
        <div className="flex items-center gap-3">
          <span className="synapse-logo">
            SYNAPSE AI
          </span>
          <span className="synapse-logo-dot" />
        </div>

        <div className="flex items-center gap-2">
          {/* Session badge */}
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.68rem',
            color: 'rgba(71,85,105,0.7)',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '4px 10px',
            letterSpacing: '0.05em',
          }}>
            {sessionId.slice(0, 16)}…
          </span>

          <button
            type="button"
            onClick={() => {
              setMessages([])
              setSessionId(resetSessionId())
            }}
            className="glass-btn danger"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3" />
            </svg>
            New Session
          </button>

          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="glass-btn"
            style={{
              background: 'rgba(139,92,246,0.08)',
              borderColor: 'rgba(139,92,246,0.2)',
              color: '#c4b5fd',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            How to Use
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="chat-layout" style={{ flex: 1 }}>

        {/* Messages */}
        <div className="messages-container">
          {messages.length === 0 && !isSending ? (
            <div className="empty-state">
              <div className="empty-state-icon">⚡</div>
              <p className="empty-state-text">
                Ask anything — Synapse AI automatically routes to{' '}
                <span style={{ color: '#a78bfa' }}>ArXiv</span>,{' '}
                <span style={{ color: '#ec4899' }}>RAG</span>,{' '}
                <span style={{ color: '#22d3ee' }}>SQL</span>, or{' '}
                <span style={{ color: '#fb923c' }}>Web Search</span>.
                <br />
                <span style={{ opacity: 0.6, fontSize: '0.8rem', display: 'block', marginTop: 8 }}>
                  Press <kbd style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 5,
                    padding: '1px 6px',
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                  }}>?</kbd> or click "How to Use" to see examples.
                </span>
              </p>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <div key={m.id} className={`message-row ${m.role}`}>
                  {m.role === 'assistant' && (
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginRight: 8, marginTop: 2,
                      background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', boxShadow: '0 0 12px rgba(139,92,246,0.4)',
                    }}>⚡</div>
                  )}
                  <div className={`message-bubble ${m.role}`}>
                    {m.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isSending && (
                <div className="message-row assistant">
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginRight: 8,
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem',
                  }}>⚡</div>
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              )}
            </>
          )}

          {sendError && (
            <div className="error-banner">
              ⚠ {sendError}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
            rows={2}
          />

          <div className="chat-input-divider" />

          <div className="chat-input-footer">
            <input
              type="text"
              className="db-url-input"
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value)}
              placeholder="DB URL (optional): mysql://user:pass@localhost:3306/db"
            />

            <span style={{ fontSize: '0.7rem', color: 'rgba(71,85,105,0.6)', flexShrink: 0 }}>
              {charCount}
            </span>

            <button
              type="button"
              className="clear-btn"
              onClick={() => setDraft('')}
            >
              Clear
            </button>

            <button
              type="button"
              className="send-btn"
              onClick={() => void onSend()}
              disabled={!draft.trim() || isSending}
            >
              {isSending ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Sending
                </>
              ) : (
                <>
                  Send
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Document uploader */}
        <DocumentUploader />
      </div>

      {/* How to use panel */}
      <HowToUsePanel
        open={guideOpen}
        onOpenChange={setGuideOpen}
        onInsertMessage={(m) => setDraft(m)}
        onPrefillDbUrl={(u) => setDbUrl(u)}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
