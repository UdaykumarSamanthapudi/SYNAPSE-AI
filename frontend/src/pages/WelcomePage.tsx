import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/* Particle data */
interface Particle {
  id: number
  left: string
  size: number
  duration: string
  delay: string
  color: string
}

const COLORS = [
  'rgba(139,92,246,0.7)',
  'rgba(236,72,153,0.7)',
  'rgba(34,211,238,0.7)',
  'rgba(251,146,60,0.5)',
  'rgba(167,243,208,0.5)',
]

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    duration: `${Math.random() * 12 + 8}s`,
    delay: `${Math.random() * 8}s`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }))
}

const PARTICLES = generateParticles(40)

export function WelcomePage() {
  const navigate = useNavigate()
  const cardRef = useRef<HTMLDivElement>(null)

  /* Subtle mouse parallax on the hero card */
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (window.innerWidth / 2)
      const dy = (e.clientY - cy) / (window.innerHeight / 2)
      cardRef.current.style.transform = `perspective(1200px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg) translateZ(0)`
    }

    const handleLeave = () => {
      if (cardRef.current) {
        cardRef.current.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0)'
        cardRef.current.style.transition = 'transform 0.6s ease'
      }
    }

    const handleEnter = () => {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.1s ease'
      }
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseleave', handleLeave)
    window.addEventListener('mouseenter', handleEnter)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('mouseenter', handleEnter)
    }
  }, [])

  return (
    <div className="synapse-welcome">
      {/* Animated Grid */}
      <div className="synapse-grid" />

      {/* Floating Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />

      {/* Scan lines */}
      <div className="synapse-scanlines" />

      {/* Floating Particles */}
      <div className="particles-container">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 py-16">
        <div
          ref={cardRef}
          className="synapse-hero-card w-full"
          style={{ maxWidth: '760px', transition: 'transform 0.1s ease' }}
        >
          {/* Status badge */}
          <div className="flex justify-center mb-8">
            <div className="synapse-status">
              <span className="synapse-status-dot" />
              System Online · All Tools Active
            </div>
          </div>

          {/* Main Title */}
          <h1
            className="glitch-title"
            data-text="WELCOME TO SYNAPSE AI"
            style={{ animation: 'titleGlow 3s ease-in-out infinite, fadeInUp 0.8s ease both' }}
          >
            WELCOME TO{' '}
            <span className="highlight">SYNAPSE AI</span>
          </h1>

          {/* Subtitle */}
          <p className="synapse-subtitle">
            Intelligent · Multi-Tool · Autonomous Agent
          </p>

          {/* Tools row */}
          <div
            className="flex flex-wrap items-center justify-center gap-3 mt-8 mb-10"
            style={{ animation: 'fadeInUp 0.8s ease 0.4s both' }}
          >
            {[
              { icon: '🔬', label: 'ArXiv Research' },
              { icon: '📄', label: 'RAG Documents' },
              { icon: '🗄️', label: 'SQL Database' },
              { icon: '🌐', label: 'Web Search' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.18)',
                  fontSize: '0.78rem',
                  color: 'rgba(196,181,253,0.9)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="synapse-cta-btn"
            >
              <span>Enter Synapse</span>
              <span className="btn-arrow text-xl">→</span>
            </button>
          </div>

          {/* Bottom note */}
          <p
            className="text-center mt-8 text-xs"
            style={{
              color: 'rgba(71,85,105,0.7)',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.05em',
              animation: 'fadeInUp 1s ease 1.2s both',
            }}
          >
            Base URL: http://127.0.0.1:8000 · FastAPI Backend
          </p>
        </div>
      </div>
    </div>
  )
}
