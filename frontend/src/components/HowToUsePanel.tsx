import { useState } from 'react'

type HowToUsePanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsertMessage: (message: string) => void
  onPrefillDbUrl: (dbUrl: string) => void
}

type ExampleQuery = {
  label: string
  message: string
  dbUrl?: string
}

type Tool = {
  key: string
  icon: string
  title: string
  subtitle: string
  triggerKeywords: string[]
  examples: ExampleQuery[]
}

const TOOLS: Tool[] = [
  {
    key: 'arxiv',
    icon: '🔬',
    title: 'ArXiv Research',
    subtitle: 'Find scientific & academic papers from arXiv.',
    triggerKeywords: ['research paper', 'arxiv', 'academic paper', 'scientific paper'],
    examples: [
      { label: 'Transformer models', message: 'find research papers about transformer models in machine learning' },
      { label: 'Large language models', message: 'find research papers about large language models' },
      { label: 'Computer vision', message: 'find academic papers about computer vision and image recognition' },
    ],
  },
  {
    key: 'rag',
    icon: '📄',
    title: 'RAG – Your Documents',
    subtitle: 'Search inside files you have uploaded. Upload a PDF/TXT first using the panel below the chat.',
    triggerKeywords: ['my documents', 'from my files', 'search my documents'],
    examples: [
      { label: 'Skills in resume', message: 'search my documents and tell me the skills listed in the resume' },
      { label: 'Experience summary', message: 'search my documents for work experience' },
      { label: 'Education details', message: 'search my documents about education qualifications' },
    ],
  },
  {
    key: 'db',
    icon: '🗄️',
    title: 'Database Query',
    subtitle: 'Query your SQL database. Paste your DB connection URL in the "DB URL" field below the chat box, then ask naturally.',
    triggerKeywords: ['database', 'table', 'sql', 'records', 'from db'],
    examples: [
      { label: 'All users', message: 'give me all the users in the user table', dbUrl: 'mysql://root:password@localhost:3306/yourdb' },
      { label: 'Customer records', message: 'list all records from the customers table', dbUrl: 'mysql://root:password@localhost:3306/yourdb' },
      { label: 'Recent orders', message: 'show me the last 10 orders from the orders table', dbUrl: 'mysql://root:password@localhost:3306/yourdb' },
    ],
  },
  {
    key: 'web',
    icon: '🌐',
    title: 'Web Search',
    subtitle: 'Get current information, facts, and news from the internet.',
    triggerKeywords: ['what is', 'latest', 'current', 'news', 'how to'],
    examples: [
      { label: 'General question', message: 'what is the capital of France?' },
      { label: 'Latest news', message: 'what is the latest news about artificial intelligence?' },
      { label: 'Tech info', message: 'what is the difference between Python and JavaScript?' },
    ],
  },
]

export function HowToUsePanel(props: HowToUsePanelProps) {
  const [active, setActive] = useState<string>('all')

  if (!props.open) return null

  const visibleTools = active === 'all' ? TOOLS : TOOLS.filter(t => t.key === active)

  const tabs = [
    ['all', 'All Tools'],
    ['arxiv', '🔬 ArXiv'],
    ['rag', '📄 Documents'],
    ['db', '🗄️ Database'],
    ['web', '🌐 Web'],
  ]

  return (
    <div className="how-to-overlay">
      <div
        className="how-to-backdrop"
        onClick={() => props.onOpenChange(false)}
        role="presentation"
      />

      <aside className="how-to-panel">

        {/* Header */}
        <div className="how-to-panel-header">
          <div>
            <h2 className="how-to-title">How to Use Synapse AI</h2>
            <p className="how-to-subtitle">
              Just type your question naturally — click any example to use it instantly.
            </p>
          </div>
          <button type="button" className="glass-btn" onClick={() => props.onOpenChange(false)}>
            ✕ Close
          </button>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`filter-tab ${active === key ? 'active' : ''}`}
              onClick={() => setActive(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tool sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visibleTools.map(tool => (
            <div key={`${tool.key}-${tool.title}`} className="example-card">

              {/* Tool header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{tool.icon}</span>
                <div>
                  <div className="example-card-title">{tool.title}</div>
                  <p className="example-card-subtitle">{tool.subtitle}</p>
                </div>
              </div>

              {/* Trigger keywords */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                {tool.triggerKeywords.map(kw => (
                  <span key={kw} className="keyword-tag">{kw}</span>
                ))}
              </div>

              {/* Example queries — plain text, clickable */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tool.examples.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => {
                      if (ex.dbUrl) props.onPrefillDbUrl(ex.dbUrl)
                      props.onInsertMessage(ex.message)
                      props.onOpenChange(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      textAlign: 'left',
                      background: 'rgba(139,92,246,0.06)',
                      border: '1px solid rgba(139,92,246,0.15)',
                      borderRadius: 10,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.14)'
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.35)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.06)'
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.15)'
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', color: '#a78bfa', flexShrink: 0 }}>▶</span>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.82rem',
                      color: '#cbd5e1',
                      lineHeight: 1.4,
                      flex: 1,
                    }}>
                      {ex.message}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      color: 'rgba(139,92,246,0.7)',
                      flexShrink: 0,
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      Click to use
                    </span>
                  </button>
                ))}
              </div>

              {/* DB URL reminder */}
              {tool.key === 'db' && (
                <p style={{
                  marginTop: 10,
                  fontSize: '0.73rem',
                  color: 'rgba(100,116,139,0.8)',
                  lineHeight: 1.5,
                  padding: '8px 10px',
                  background: 'rgba(34,211,238,0.04)',
                  border: '1px solid rgba(34,211,238,0.12)',
                  borderRadius: 8,
                }}>
                  💡 Paste your DB connection URL in the <strong style={{ color: '#e2e8f0' }}>DB URL</strong> field below the chat box before sending.
                  <br />Example: <code style={{ color: '#67e8f9', fontFamily: 'monospace', fontSize: '0.7rem' }}>mysql://user:pass@localhost:3306/dbname</code>
                </p>
              )}

              {/* RAG reminder */}
              {tool.key === 'rag' && (
                <p style={{
                  marginTop: 10,
                  fontSize: '0.73rem',
                  color: 'rgba(100,116,139,0.8)',
                  lineHeight: 1.5,
                  padding: '8px 10px',
                  background: 'rgba(236,72,153,0.04)',
                  border: '1px solid rgba(236,72,153,0.12)',
                  borderRadius: 8,
                }}>
                  💡 First upload your PDF or TXT file using the <strong style={{ color: '#e2e8f0' }}>Upload Document</strong> section below the chat, then use these queries.
                </p>
              )}

            </div>
          ))}
        </div>

      </aside>
    </div>
  )
}
