import { useState, type FC } from 'react'
import { X, Bell, Zap, TrendingUp, Briefcase, BookOpen, Check, Trash2 } from 'lucide-react'
import { cn } from '../lib/utils'

interface NotificationItem {
  id: string
  title: string
  detail: string
  timestamp: string
  category: 'SKILL' | 'MARKET' | 'CAREER' | 'LEARNING'
  unread: boolean
  targetPage: string
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
}

export const NotificationCenter: FC<NotificationCenterProps> = ({ isOpen, onClose, onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'N-1',
      title: 'NEW SKILL SIGNAL DETECTED',
      detail: 'TypeScript demand accelerated by +31.2% across Tier 1 full-stack postings.',
      timestamp: '15m ago',
      category: 'SKILL',
      unread: true,
      targetPage: 'skill-intelligence',
    },
    {
      id: 'N-2',
      title: 'MACRO MARKET ALERT',
      detail: 'Cloud Engineer vacancies spiked +42% in Bangalore & Hyderabad tech corridors.',
      timestamp: '1h ago',
      category: 'MARKET',
      unread: true,
      targetPage: 'market-intelligence',
    },
    {
      id: 'N-3',
      title: 'CAREER OPPORTUNITY MATCH',
      detail: '3 new listings with 85%+ capability match found: Senior Full Stack Developer at TechCorp.',
      timestamp: '3h ago',
      category: 'CAREER',
      unread: false,
      targetPage: 'job-finder',
    },
    {
      id: 'N-4',
      title: 'RESISTANCE LEARNING OBJECTIVE',
      detail: 'Sprint 01: TypeScript Advanced Metaprogramming syllabus is ready for execution.',
      timestamp: 'Yesterday',
      category: 'LEARNING',
      unread: false,
      targetPage: 'roadmap',
    },
  ])

  if (!isOpen) return null

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const handleItemClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    )
    onNavigate(item.targetPage)
    onClose()
  }

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'SKILL':
        return <Zap size={14} className="text-emerald-400" />
      case 'MARKET':
        return <TrendingUp size={14} className="text-crimson" />
      case 'CAREER':
        return <Briefcase size={14} className="text-blue-400" />
      case 'LEARNING':
        return <BookOpen size={14} className="text-amber-400" />
      default:
        return <Bell size={14} />
    }
  }

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-md bg-charcoal h-full border-l border-burgundy/40 shadow-glow-crimson flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-burgundy/30 flex items-center justify-between bg-obsidian/70">
          <div className="flex items-center gap-2.5">
            <Bell size={18} className="text-crimson" />
            <h3 className="heading-xs text-warm-ivory">INTELLIGENCE ALERTS</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-crimson text-warm-ivory text-[10px] font-mono font-bold">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-warm-ivory/40 hover:text-crimson p-1">
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-2.5 border-b border-burgundy/20 flex items-center justify-between text-xs font-mono text-warm-ivory/60 bg-burgundy/10">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="hover:text-warm-ivory disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Check size={12} /> Mark all read
          </button>
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="hover:text-crimson disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Trash2 size={12} /> Clear wire
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'p-3.5 rounded-lg border cursor-pointer transition-all space-y-1.5',
                  item.unread
                    ? 'bg-burgundy/20 border-crimson/50 text-warm-ivory'
                    : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/70 hover:bg-burgundy/15'
                )}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1 font-bold">
                    {getIcon(item.category)}
                    <span>{item.category} ALERT</span>
                  </span>
                  <span className="text-warm-ivory/40">{item.timestamp}</span>
                </div>
                <h4 className="text-xs font-bold text-warm-ivory font-mono leading-tight">{item.title}</h4>
                <p className="text-[11px] font-mono text-warm-ivory/70 leading-relaxed">{item.detail}</p>
                <div className="pt-1 flex items-center justify-end text-[10px] font-mono text-crimson font-bold">
                  <span>DISPATCH TO BRIEFING →</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs font-mono text-warm-ivory/40">
              Zero pending intelligence transmissions.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-obsidian/90 border-t border-burgundy/30 text-center text-[10px] font-mono text-warm-ivory/40">
          SECURE CHANNEL // 256-BIT ENCRYPTED TELEMETRY
        </div>
      </div>
    </div>
  )
}
