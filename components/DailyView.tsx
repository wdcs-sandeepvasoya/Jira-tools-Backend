'use client'

import { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '@/lib/config'
import { authenticatedFetch, getUser } from '@/utils/auth'

interface User {
  id: number
  name: string
  urls: string[]
  jiraLogs: JiraLog[]
}

interface JiraLog {
  id: string
  taskId: string
  description: string
  date: string
  time_spent_seconds: number
  emoji?: string
  flag?: string
  started_at?: string
}

interface Team {
  id: number
  name: string
  users: User[]
  // optional type to support icons/colors
  type?: 'engineering' | 'qa' | 'design' | 'other'
}

interface CalendarApiResponse {
  success?: boolean
  data?: Record<string, Team[]>
  // allow fallback if API returns plain mapping
  [key: string]: any
}

interface CalendarDay {
  date: number
  teams: Team[]
}

interface DailyViewProps {
  currentDate?: Date
}

export default function DailyView({ currentDate = new Date() }: DailyViewProps) {
  const [currentMonth, setCurrentMonth] = useState(currentDate)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [calendarData, setCalendarData] = useState<Record<string, Team[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hoursFilter, setHoursFilter] = useState<'below' | 'above'>('below')
  const [selectBelowOnly, setSelectBelowOnly] = useState<boolean>(true)
  const [userInputs, setUserInputs] = useState<Record<string, string>>({})
  const [commonNote, setCommonNote] = useState<string>('')
  const [sendValidation, setSendValidation] = useState<string>('')
  const [emailInput, setEmailInput] = useState<string>('')
  const [emailChips, setEmailChips] = useState<Array<{name: string, email: string}>>([])
  const [isSending, setIsSending] = useState<boolean>(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTeamModal(false)
        setShowUserModal(false)
      }
    }

    if (showTeamModal || showUserModal) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showTeamModal, showUserModal])
  const sampleData: { [key: string]: Team[] } = {
    '1': [
      {
        id: 1,
        name: 'Team-1',
        users: [
          {
            id: 1,
            name: 'Parmar Makesh',
            urls: ['https://examol.comjj'],
            jiraLogs: [
              {
                id: '1',
                taskId: 'TIOM-137',
                description: 'Parmar Makesh — August 25',
                date: 'August 25',
                time_spent_seconds: 8.5 * 3600,
                emoji: '👋',
                flag: '🇮🇳'
              },
              {
                id: '2',
                taskId: 'TIOM-138',
                description: 'Parmar Makesh — August 25',
                date: 'August 25',
                time_spent_seconds: 8.5 * 3600,
                emoji: '👋',
                flag: '🇮🇳'
              },
            ]
          },
          {
            id: 2,
            name: 'Mayur Patel',
            urls: ['https://demo.com/patel', 'https://example.com/mayur'],
            jiraLogs: [
              {
                id: '2',
                taskId: 'TIOM-138',
                description: 'Mayur Patel — August 25',
                date: 'August 25',
                time_spent_seconds: 7.5 * 3600
              }
            ]
          },
          {
            id: 3,
            name: 'Park Mahesh',
            urls: ['https://park.com/mahesh'],
            jiraLogs: [
              {
                id: '3',
                taskId: 'TIOM-139',
                description: 'Park Mahesh — August 25',
                date: 'August 25',
                time_spent_seconds: 6.0 * 3600
              }
            ]
          }
        ]
      },
      {
        id: 2,
        name: 'Team-2',
        users: [
          {
            id: 4,
            name: 'Tarang Patel',
            urls: ['https://tarang.com/patel'],
            jiraLogs: [
              {
                id: '4',
                taskId: 'TIOM-140',
                description: 'Tarang Patel — August 25',
                date: 'August 25',
                time_spent_seconds: 8.0 * 3600
              }
            ]
          },
          {
            id: 5,
            name: 'Yash Shah',
            urls: ['https://demo.com/hhf/66', 'https://examol.comj'],
            jiraLogs: [
              {
                id: '5',
                taskId: 'TIOM-141',
                description: 'Yash Shah — August 25',
                date: 'August 25',
                time_spent_seconds: 7.0 * 3600
              }
            ]
          }
        ]
      }
    ],
    '2': [
      {
        id: 3,
        name: 'Team-3',
        users: [
          {
            id: 6,
            name: 'John Doe',
            urls: ['https://john.com/doe'],
            jiraLogs: [
              {
                id: '6',
                taskId: 'TIOM-142',
                description: 'John Doe — August 25',
                date: 'August 25',
                time_spent_seconds: 6.5 * 3600
              }
            ]
          }
        ]
      },
      {
        id: 2,
        name: 'Team-2',
        users: [
          {
            id: 4,
            name: 'Tarang Patel',
            urls: ['https://tarang.com/patel'],
            jiraLogs: [
              {
                id: '4',
                taskId: 'TIOM-140',
                description: 'Tarang Patel — August 25',
                date: 'August 25',
                time_spent_seconds: 8.0 * 3600
              }
            ]
          },
          {
            id: 5,
            name: 'Yash Shah',
            urls: ['https://demo.com/hhf/66', 'https://examol.comj'],
            jiraLogs: [
              {
                id: '5',
                taskId: 'TIOM-141',
                description: 'Yash Shah — August 25',
                date: 'August 25',
                time_spent_seconds: 7.0 * 3600
              }
            ]
          }
        ]
      }
    ],
    '15': [
      {
        id: 1,
        name: 'Team-1',
        users: [
          {
            id: 1,
            name: 'Parmar Makesh',
            urls: ['https://examol.comjj'],
            jiraLogs: [
              {
                id: '1',
                taskId: 'TIOM-137',
                description: 'Parmar Makesh — August 25',
                date: 'August 25',
                time_spent_seconds: 8.5 * 3600,
                emoji: '👋',
                flag: '🇮🇳'
              }
            ]
          }
        ]
      }
    ],
    '20': [
      {
        id: 4,
        name: 'Team-4',
        users: [
          {
            id: 7,
            name: 'Jane Smith',
            urls: ['https://jane.com/smith', 'https://smith.com/jane'],
            jiraLogs: [
              {
                id: '7',
                taskId: 'TIOM-143',
                description: 'Jane Smith — August 25',
                date: 'August 25',
                time_spent_seconds: 7.5 * 3600
              }
            ]
          }
        ]
      }
    ]
  }
  
  
  const getMonthIndex = (monthName: string): number => {
    const months = ['january','february','march','april','may','june','july','august','september','october','november','december']
    return months.indexOf(monthName.toLowerCase())
  }

  // Extract normalized Y/M/D from a log
  const getYMDFromLog = (log: JiraLog, fallbackYear: number): { y: number, m: number, d: number } | null => {
    if (log.started_at) {
      const d = new Date(log.started_at)
      if (isNaN(d.getTime())) return null
      // Use UTC to avoid timezone shifting the date
      return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() }
    }
    if (log.date) {
      // Support values like "August 25"
      const parts = log.date.trim().split(/\s+/)
      if (parts.length >= 2) {
        const monthIdx = getMonthIndex(parts[0])
        const day = parseInt(parts[1], 10)
        if (monthIdx >= 0 && !isNaN(day)) {
          return { y: fallbackYear, m: monthIdx, d: day }
        }
      }
      // Fallback: attempt to parse and then normalize to local Y/M/D
      const d2 = new Date(`${log.date} ${fallbackYear}`)
      if (isNaN(d2.getTime())) return null
      return { y: d2.getFullYear(), m: d2.getMonth(), d: d2.getDate() }
    }
    return null
  }

  const sameMonthAndYear = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

  const formatTimeFromSeconds = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0h'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0 && minutes > 0 && remainingSeconds > 0) {
      return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${remainingSeconds.toString().padStart(2, '0')}s`
    } else if (hours > 0 && minutes > 0) {
      return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else if (minutes > 0) {
      return `${minutes}m`
    } else {
      return `${remainingSeconds}s`
    }
  }

  const getUserTotalTime = (user: User): number => {
    return (user.jiraLogs || []).reduce((sum, log) => sum + (log.time_spent_seconds || 0), 0)
  }

  const rebuildMappingFromSource = (source: Record<string, Team[]> | Team[], monthDate: Date): Record<string, Team[]> => {
    const teamsArray: Team[] = Array.isArray(source)
      ? source as Team[]
      : Object.values(source as Record<string, Team[]>).flat()

    const byDay: Record<string, Team[]> = {}

    const ensureTeam = (dayKey: string, t: Team): Team => {
      if (!byDay[dayKey]) byDay[dayKey] = []
      let entry = byDay[dayKey].find(x => x.id === t.id)
      if (!entry) {
        entry = { id: t.id, name: t.name, users: [], type: t.type }
        byDay[dayKey].push(entry)
      }
      return entry
    }

    const targetYear = monthDate.getFullYear()
    const targetMonth = monthDate.getMonth()

    teamsArray.forEach(team => {
      (team.users || []).forEach(user => {
        (user.jiraLogs || []).forEach(log => {
          const ymd = getYMDFromLog(log, targetYear)
          if (!ymd) return
          if (ymd.y !== targetYear || ymd.m !== targetMonth) return
          const dayKey = String(ymd.d)
          const teamEntry = ensureTeam(dayKey, team)

          // attach this user's logs for this day only, using UTC-aware parsing
          const dayLogs = (user.jiraLogs || []).filter(l => {
            const p = getYMDFromLog(l, targetYear)
            return !!p && p.y === targetYear && p.m === targetMonth && p.d === ymd.d
          })
          if (!teamEntry.users.find(u => u.id === user.id)) {
            teamEntry.users.push({ ...user, jiraLogs: dayLogs })
          }
        })
      })
    })

    return byDay
  }

  // Fetch teams data for month
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)
        const currentUser = getUser()
        const body = {
          loginUserId: currentUser?.id ?? 1,
          month: currentMonth.getMonth() + 1,
          year: currentMonth.getFullYear(),
          hoursFilter: hoursFilter
        }
        const res = await authenticatedFetch(API_ENDPOINTS.NODE_API.MY_TEAMS_TEAMS_DATA, {
          method: 'POST',
          body: JSON.stringify(body)
        })
        const payload: CalendarApiResponse = await res.json()
        // Accept mapping if provided, but rebuild by started_at to be safe
        let source: Record<string, Team[]> | Team[] = sampleData
        if (payload && payload.data) {
          source = payload.data as Record<string, Team[]> | Team[]
        }
        const mapping = rebuildMappingFromSource(source, currentMonth)
        setCalendarData(mapping)
      } catch (err) {
        console.error('Failed to load calendar data', err)
        setErrorMessage('Failed to load teams data')
        // Fallback to local sample rebuilt mapping so UI still shows something
        setCalendarData(rebuildMappingFromSource([], currentMonth))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCalendarData()
  }, [currentMonth, hoursFilter])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const isCurrentDate = (day: number) => {
    const today = new Date()
    return today.getDate() === day && 
           today.getMonth() === currentMonth.getMonth() && 
           today.getFullYear() === currentMonth.getFullYear()
  }

  const getTeamsForDate = (day: number): Team[] => {
    return calendarData[day.toString()] || []
  }

  const handleTeamClick = (team: Team, day: number) => {
    setSelectedTeam(team)
    setSelectedDay(day)
    setCommonNote('')
    setSendValidation('')
    setEmailChips([])
    setEmailInput('')
    setShowTeamModal(true)
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const openUrl = (url: string) => {
    window.open(url, '_blank')
  }

  const handleUserInputChange = (userId: number, value: string) => {
    setUserInputs(prev => ({ ...prev, [userId]: value }))
  }

  const validateEmails = (text: string): boolean => {
    // Regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    // Split by comma and clean up whitespace
    const emails = text.split(',').map(email => email.trim()).filter(email => email.length > 0)
    
    // Check if all emails are valid
    return emails.every(email => emailRegex.test(email))
  }

  const addEmailChip = () => {
    const email = emailInput.trim()
    if (!email) return
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setSendValidation('Please enter a valid email address')
      return
    }
    
    // Check if email already exists
    if (emailChips.some(chip => chip.email === email)) {
      setSendValidation('This email is already added')
      return
    }
    
    // Try to find user by name in the team (using email prefix)
    const emailPrefix = email.split('@')[0].toLowerCase()
    const user = selectedTeam?.users.find(u => 
      u.name.toLowerCase().includes(emailPrefix)
    )
    
    const name = user ? user.name : emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
    //const name = "Hello greeting from WDCS";
    
    setEmailChips(prev => [...prev, { name, email }])
    setEmailInput('')
    setSendValidation('')
  }
  
  const removeEmailChip = (emailToRemove: string) => {
    setEmailChips(prev => prev.filter(chip => chip.email !== emailToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addEmailChip()
    }
  }

  const handleSendSelected = async () => {
    if (emailChips.length === 0) {
      setSendValidation('Please add at least one email address')
      return
    }
    
    setIsSending(true)
    setSendValidation('')
    
    try {
      const payload = {
        date: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`,
        emails: emailChips
      }
      
      console.log('Sending emails with payload:', payload)
      
      const response = await fetch(API_ENDPOINTS.NODE_API.SEND_EMAILS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        setSendValidation('Emails sent successfully!')
        // Clear form after successful send
        setTimeout(() => {
          setEmailChips([])
          setSendValidation('')
        }, 2000)
      } else {
        const errorData = await response.json()
        setSendValidation(`Failed to send emails: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      setSendValidation('Failed to send emails. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const formatSelectedDate = (): string => {
    if (selectedDay === null) return ''
    const selectedDate = new Date(currentMonth)
    selectedDate.setDate(selectedDay)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${dayNames[selectedDate.getDay()]}, ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
    const days = []
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-3"></div>)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const teams = getTeamsForDate(day)
      const teamColors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-orange-100 text-orange-800', 'bg-purple-100 text-purple-800', 'bg-pink-100 text-pink-800']
      
      days.push(
        <div key={day} className="p-3 border border-gray-200 min-h-[140px] hover:bg-gray-50 transition-all duration-200 ease-in-out rounded-lg">
          <div className={`text-sm font-bold mb-3 ${isCurrentDate(day) ? 'bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-2">
            {teams.length > 0 ? (
              teams.map((team, index) => (
                <div 
                  key={team.id} 
                  className={`text-sm px-2 py-1 rounded-full font-medium cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm ${teamColors[index % teamColors.length]} border border-transparent hover:border-gray-300`}
                  onClick={() => handleTeamClick(team, day)}
                >
                  {team.name}
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm text-center py-3">
                No teams
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return days
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CSS for modal animations */}
      <style jsx>{`
        @keyframes modalEnter {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      {/* Clean Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📅</span>
            <h1 className="text-2xl font-bold text-gray-900">Daily View</h1>
          </div>
          
          {/* Hours Filter Tabs */}
          <div className="mt-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Show:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setHoursFilter('below')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${
                    hoursFilter === 'below'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Missing Hours (&lt;8h)
                </button>
                <button
                  onClick={() => setHoursFilter('above')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${
                    hoursFilter === 'above'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Logged Hours (≥8h)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Calendar Header Controls */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              {/* Month Navigation */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-md hover:bg-gray-100 transition-all duration-200 ease-in-out"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {formatMonthYear(currentMonth)}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-md hover:bg-gray-100 transition-all duration-200 ease-in-out"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Month/Year Selectors and Today Button */}
              <div className="flex items-center space-x-3">
                <select
                  value={currentMonth.getMonth()}
                  onChange={(e) => {
                    const monthIndex = Number(e.target.value)
                    setCurrentMonth(prev => {
                      const d = new Date(prev)
                      d.setMonth(monthIndex)
                      return d
                    })
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={i}>
                      {new Date(2000, i, 1).toLocaleString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={currentMonth.getFullYear()}
                  onChange={(e) => {
                    const year = Number(e.target.value)
                    setCurrentMonth(prev => {
                      const d = new Date(prev)
                      d.setFullYear(year)
                      return d
                    })
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 7 }).map((_, i) => {
                    const base = new Date().getFullYear()
                    const y = base - 3 + i
                    return (
                      <option key={y} value={y}>{y}</option>
                    )
                  })}
                </select>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="bg-blue-600 text-white rounded-md px-3 py-1 text-sm font-medium hover:bg-blue-700 transition-all duration-200 ease-in-out"
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-xl shadow-md p-6">
            {isLoading && (
              <div className="text-sm text-gray-500 mb-3">Loading teams...</div>
            )}
            {errorMessage && (
              <div className="text-sm text-red-600 mb-3">{errorMessage}</div>
            )}
            <div className="grid grid-cols-7 gap-1 border border-gray-200 rounded-xl overflow-hidden bg-white">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-50 p-4 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {renderCalendar()}
            </div>
          </div>
        </div>
      </div>

      {/* Team Modal */}
      {showTeamModal && selectedTeam && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTeamModal(false)
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden transform scale-95 opacity-0 animate-in"
            style={{
              animation: 'modalEnter 0.2s ease-out forwards'
            }}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedTeam.name}</h3>
                  <div className="w-12 h-0.5 bg-blue-500 rounded-full"></div>
                </div>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-all duration-200 ease-in-out p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              {hoursFilter === 'below' && (
                <div className="mb-4 flex items-center gap-3">
                  <input
                    type="text"
                    className="flex-1 h-11 border border-gray-200 rounded-lg px-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder:text-gray-400 shadow-inner"
                    placeholder="Enter email address and press Enter or click Add Email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    onClick={addEmailChip}
                    className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out"
                  >
                    Add Email
                  </button>
                </div>
              )}
              {sendValidation && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  sendValidation.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {sendValidation}
                </div>
              )}
              <div className="space-y-3">
                {emailChips.map((chip, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1"
                  >
                    <span>{chip.name}</span>
                    <button
                      onClick={() => removeEmailChip(chip.email)}
                      className="text-blue-800 hover:text-blue-900 text-lg"
                    >
                      ✗
                    </button>
                  </span>
                ))}
                
                {emailChips.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={handleSendSelected}
                      disabled={isSending}
                      className="w-full bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200 ease-in-out"
                    >
                      {isSending ? 'Sending...' : 'Send Emails'}
                    </button>
                  </div>
                )}
                
                {(selectedTeam.users || []).filter(u => {
                  const total = getUserTotalTime(u)
                  return hoursFilter === 'below' ? total < 8 * 3600 : total >= 8 * 3600
                }).map(user => (
                  <div 
                    key={user.id}
                    className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-white shadow-sm hover:shadow-md transition-all duration-200 ease-in-out ring-1 ring-transparent hover:ring-blue-200"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold shadow">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">{user.name}</div>
                        <div className="text-gray-500 text-xs">
                          {(() => {
                            const total = getUserTotalTime(user)
                            return formatTimeFromSeconds(total)
                          })()}
                        </div>
                      </div>
                    </div>
                    {user.jiraLogs.length > 1 && (
                      <div className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
                        {user.jiraLogs.length} logs
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUserModal(false)
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden transform scale-95 opacity-0 animate-in"
            style={{
              animation: 'modalEnter 0.2s ease-out forwards'
            }}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedUser.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {formatSelectedDate()}
                  </p>
                  <div className="flex items-center space-x-2">
                    {getUserTotalTime(selectedUser) > 0 && (
                      <span className={`font-semibold text-sm px-3 py-1 rounded-md border ${
                        hoursFilter === 'below' 
                          ? 'text-red-600 bg-red-50 border-red-200' 
                          : 'text-green-600 bg-green-50 border-green-200'
                      }`}>
                        Total: {formatTimeFromSeconds(getUserTotalTime(selectedUser))}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-all duration-200 ease-in-out p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {selectedUser.jiraLogs.map(log => (
                  <div 
                    key={log.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ease-in-out"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {log.taskId}
                        </span>
                        {log.time_spent_seconds > 0 && (
                          <svg 
                            className="h-4 w-4 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors duration-200" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                            onClick={(e) => {
                              e.stopPropagation()
                              const jiraUrl = API_ENDPOINTS.JIRA.BROWSE_TICKET(log.taskId)
                              window.open(jiraUrl, '_blank')
                            }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        )}
                      </div>
                      <span className="text-green-600 font-medium text-sm">
                        {log.time_spent_seconds > 0 ? `${formatTimeFromSeconds(log.time_spent_seconds)} total` : ''}
                      </span>
                    </div>
                    <div className="text-gray-900 text-sm mb-2">
                      {log.description}
                    </div>
                    <div className="flex items-center space-x-2">
                      {log.emoji && <span className="text-lg">{log.emoji}</span>}
                      {log.flag && <span className="text-lg">{log.flag}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
