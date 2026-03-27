import { ChatMessage } from '../services/api'

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

const KEY = 'glowcare_chat_history'

export function useChatHistory() {
  const load = (): ChatSession[] => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]')
    } catch { return [] }
  }

  const save = (sessions: ChatSession[]) => {
    try { localStorage.setItem(KEY, JSON.stringify(sessions.slice(0, 20))) } catch {}
  }

  const saveSession = (session: ChatSession) => {
    const all = load()
    const idx = all.findIndex(s => s.id === session.id)
    if (idx >= 0) all[idx] = session
    else all.unshift(session)
    save(all)
  }

  const deleteSession = (id: string) => {
    save(load().filter(s => s.id !== id))
  }

  const getSessions = () => load()

  const newSessionId = () => `chat_${Date.now()}`

  const titleFromMessages = (msgs: ChatMessage[]) => {
    const first = msgs.find(m => m.role === 'user')?.content ?? 'New conversation'
    return first.length > 40 ? first.slice(0, 40) + '…' : first
  }

  return { saveSession, deleteSession, getSessions, newSessionId, titleFromMessages }
}
