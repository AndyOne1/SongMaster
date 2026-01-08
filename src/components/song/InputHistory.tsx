import { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { History, Trash2 } from 'lucide-react'

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

  const saveToHistory = (songDesc: string, styleDesc: string) => {
    if (!songDesc.trim() && !styleDesc.trim()) return

    const newItem: InputHistoryItem = {
      timestamp: Date.now(),
      songDescription: songDesc,
      styleDescription: styleDesc,
      artistName: undefined // Could add artist name if needed
    }

    // Remove duplicates and add new item at the beginning
    const filtered = history.filter(
      item => item.songDescription !== songDesc || item.styleDescription !== styleDesc
    )
    const updated = [newItem, ...filtered].slice(0, MAX_ITEMS)

    setHistory(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

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

  // Don't save current input to history (avoid duplicates while typing)
  const currentInput = { songDescription, styleDescription }

  return (
    <div className="w-64 flex-shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-gray-400" />
        <h3 className="font-medium text-gray-200">Recent Inputs</h3>
      </div>

      {history.length === 0 ? (
        <Card className="p-4 text-center text-sm text-gray-500">
          No previous inputs yet.
          <br />
          Inputs will appear here after you generate.
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
                className={`group p-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => onSelect(item.songDescription, item.styleDescription)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">
                      {formatDate(item.timestamp)}
                    </p>
                    {item.songDescription && (
                      <p className="text-sm text-gray-300 mb-1 line-clamp-2">
                        {truncate(item.songDescription, 50)}
                      </p>
                    )}
                    {item.styleDescription && (
                      <p className="text-xs text-gray-500 line-clamp-1">
                        Style: {truncate(item.styleDescription, 40)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(item.timestamp)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded"
                  >
                    <Trash2 className="h-3 w-3 text-gray-500 hover:text-red-400" />
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
