import { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { History, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface InputHistoryItem {
  timestamp: number
  songDescription: string
  styleDescription: string
  artistName?: string
}

interface InputHistoryProps {
  songDescription: string
  styleDescription: string
  onSelect: (songDesc: string, styleDesc: string) => void
}

const MAX_ITEMS = 10
const STORAGE_KEY = 'songmaster-input-history'

export function InputHistory({ songDescription, styleDescription, onSelect }: InputHistoryProps) {
  const [history, setHistory] = useState<InputHistoryItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {
        setHistory([])
      }
    }
  }, [])

  const removeItem = (timestamp: number) => {
    const updated = history.filter(item => item.timestamp !== timestamp)
    setHistory(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncate = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }

  const currentInput = { songDescription, styleDescription }

  return (
    <div className="w-64 flex-shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-luxury-800 border border-white/10">
          <History className="h-4 w-4 text-champagne-500" />
        </div>
        <h3 className="font-display font-medium text-ivory-100">Recent Inputs</h3>
      </div>

      {history.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-luxury-800 border border-white/5">
              <History className="h-5 w-5 text-champagne-500/50" />
            </div>
          </div>
          <p className="text-sm text-champagne-500 mb-1">No previous inputs yet</p>
          <p className="text-xs text-champagne-500/50">Inputs will appear here after you generate</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {history.map((item) => {
            const isCurrentSongDesc = item.songDescription === currentInput.songDescription
            const isCurrentStyleDesc = item.styleDescription === currentInput.styleDescription
            const isActive = isCurrentSongDesc && isCurrentStyleDesc

            return (
              <Card
                key={item.timestamp}
                className={cn(
                  'cursor-pointer p-3 transition-all duration-300 group',
                  isActive
                    ? 'border-violet-500/30 bg-violet-500/5'
                    : 'border-white/10 hover:border-white/20 hover:bg-luxury-800/50'
                )}
                onClick={() => onSelect(item.songDescription, item.styleDescription)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-champagne-500 mb-1.5 uppercase tracking-wider">
                      {formatDate(item.timestamp)}
                    </p>
                    {item.songDescription && (
                      <p className="text-sm text-ivory-200 mb-1.5 line-clamp-2 leading-relaxed">
                        {truncate(item.songDescription, 60)}
                      </p>
                    )}
                    {item.styleDescription && (
                      <p className="text-xs text-champagne-500 line-clamp-1">
                        Style: {truncate(item.styleDescription, 45)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(item.timestamp)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-luxury-700/50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-champagne-500 hover:text-red-400" />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function saveInputToHistory(
  songDescription: string,
  styleDescription: string,
  artistName?: string
) {
  const newItem: InputHistoryItem = {
    timestamp: Date.now(),
    songDescription,
    styleDescription,
    artistName
  }

  const saved = localStorage.getItem(STORAGE_KEY)
  const history: InputHistoryItem[] = saved ? JSON.parse(saved) : []

  const filtered = history.filter(
    item => item.songDescription !== songDescription || item.styleDescription !== styleDescription
  )
  const updated = [newItem, ...filtered].slice(0, MAX_ITEMS)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
