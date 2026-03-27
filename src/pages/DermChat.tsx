import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { MessageCircle, Send, Trash2, Sparkles, User, Bot, Plus, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { sendChatMessage, ChatMessage } from '../services/api'
import { useChatHistory, ChatSession } from '../hooks/useChatHistory'
import { useGamification } from '../hooks/useGamification'

const QUICK_PROMPTS = [
  'I have oily skin with frequent breakouts',
  'My skin feels very dry and flaky',
  'I have dark circles under my eyes',
  'How do I reduce pigmentation?',
  'What causes acne and how to treat it?',
]

function formatMessage(text: string): React.ReactNode {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g)
    const formatted = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j} className="font-bold text-teal-800">{part}</strong> : part
    )
    return <p key={i} className={line.trim() === '' ? 'h-2' : 'leading-relaxed'}>{formatted}</p>
  })
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

export default function DermChat() {
  const { saveSession, deleteSession, getSessions, newSessionId, titleFromMessages } = useChatHistory()
  const { unlockBadge } = useGamification()
  const [sessions, setSessions] = useState<ChatSession[]>(getSessions)
  const [activeId, setActiveId] = useState<string>(() => newSessionId())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const refreshSessions = () => setSessions(getSessions())

  const startNew = () => {
    setActiveId(newSessionId())
    setMessages([])
    setError(null)
    setInput('')
  }

  const loadSession = (session: ChatSession) => {
    setActiveId(session.id)
    setMessages(session.messages)
    setError(null)
    setInput('')
  }

  const removeSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteSession(id)
    refreshSessions()
    if (id === activeId) startNew()
  }

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return
    const userMsg: ChatMessage = { role: 'user', content: text.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setIsLoading(true)
    setError(null)
    try {
      const reply = await sendChatMessage(updated)
      unlockBadge('first_chat')
      const final = [...updated, { role: 'assistant' as const, content: reply }]
      setMessages(final)
      const session: ChatSession = {
        id: activeId,
        title: titleFromMessages(final),
        messages: final,
        createdAt: sessions.find(s => s.id === activeId)?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      }
      saveSession(session)
      refreshSessions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-500 to-cyan-400 text-white pt-7 pb-12 px-4 text-center flex-shrink-0">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 animate-pulse-soft" />
        <div className="relative z-10 space-y-1 max-w-sm mx-auto">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl animate-bounce-soft border border-white/30">
              <MessageCircle size={22} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Dr. Glow AI 💬</h1>
          <p className="text-teal-100 text-xs">Your personal AI dermatologist</p>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-4xl px-3 -mt-5 pb-4 flex gap-3">

        {/* Sidebar */}
        <div className={`flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-10'}`}>
          <div className="glass rounded-3xl border border-teal-100 shadow-md h-full flex flex-col overflow-hidden">
            {/* Sidebar header */}
            <div className="flex items-center justify-between p-3 border-b border-teal-50">
              {sidebarOpen && <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">History</p>}
              <button onClick={() => setSidebarOpen(o => !o)}
                className="w-7 h-7 rounded-xl bg-teal-50 hover:bg-teal-100 flex items-center justify-center transition-colors ml-auto">
                {sidebarOpen ? <ChevronLeft size={14} className="text-teal-500" /> : <ChevronRight size={14} className="text-teal-500" />}
              </button>
            </div>

            {sidebarOpen && (
              <>
                {/* New chat button */}
                <button onClick={startNew}
                  className="mx-3 mt-3 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold px-3 py-2 hover:from-teal-600 hover:to-cyan-600 transition-all shadow-sm teal-glow">
                  <Plus size={13} /> New Chat
                </button>

                {/* Session list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 mt-2">
                  {sessions.length === 0 ? (
                    <div className="text-center py-6">
                      <Clock size={20} className="text-teal-200 mx-auto mb-1" />
                      <p className="text-xs text-teal-300">No history yet</p>
                    </div>
                  ) : (
                    sessions.map(s => (
                      <div key={s.id}
                        onClick={() => loadSession(s)}
                        className={`group relative rounded-2xl px-3 py-2 cursor-pointer transition-all ${
                          s.id === activeId ? 'bg-teal-100 border border-teal-200' : 'hover:bg-teal-50 border border-transparent'
                        }`}
                      >
                        <p className="text-xs font-semibold text-teal-800 truncate pr-5">{s.title}</p>
                        <p className="text-xs text-teal-400 mt-0.5">{timeAgo(s.updatedAt)}</p>
                        <button
                          onClick={(e) => removeSession(s.id, e)}
                          className="absolute top-2 right-2 w-5 h-5 rounded-lg bg-red-100 hover:bg-red-200 items-center justify-center hidden group-hover:flex transition-colors"
                        >
                          <Trash2 size={10} className="text-red-400" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 glass rounded-3xl border border-teal-100 shadow-xl flex flex-col teal-glow min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '460px' }}>
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
                  <Sparkles size={24} className="text-teal-300" />
                </div>
                <div>
                  <p className="text-teal-700 font-bold">Ask Dr. Glow anything</p>
                  <p className="text-teal-400 text-sm mt-0.5">Describe your skin concern and get expert advice</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {QUICK_PROMPTS.map(p => (
                    <button key={p} onClick={() => send(p)}
                      className="text-xs bg-white/80 border border-teal-200 text-teal-700 rounded-full px-3 py-1.5 hover:bg-teal-50 hover:border-teal-400 transition-all font-medium active:scale-95">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-teal-500' : 'bg-gradient-to-br from-teal-400 to-cyan-400'}`}>
                  {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                </div>
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm space-y-1 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-tr-sm'
                    : 'bg-white border border-teal-100 text-teal-900 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.role === 'assistant' ? formatMessage(msg.content) : <p>{msg.content}</p>}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white border border-teal-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-teal-400 animate-bounce-soft" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && <div className="text-xs text-red-500 text-center py-2 animate-fade-in">⚠️ {error}</div>}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-teal-50 p-3">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your skin concern... (Enter to send)"
                rows={2}
                className="flex-1 rounded-2xl border-2 border-teal-200 focus:border-teal-400 bg-white/60 px-4 py-2.5 text-sm text-teal-900 placeholder-teal-300 resize-none focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-teal-200 disabled:to-cyan-200 disabled:cursor-not-allowed flex items-center justify-center shadow-md teal-glow transition-all active:scale-95 flex-shrink-0"
              >
                <Send size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
