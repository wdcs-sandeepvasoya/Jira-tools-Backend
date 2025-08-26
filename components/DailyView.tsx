'use client'

import { useState } from 'react'

interface UserLog {
  id: number
  name: string
  initials: string
  avatarColor: string
  hoursLogged: number
  hasLogs: boolean
}

interface DailyViewProps {
  currentDate?: Date
}

export default function DailyView({ currentDate = new Date() }: DailyViewProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'jira-users' | 'my-team'>('daily')
  const [showMissingHours, setShowMissingHours] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(currentDate)

  // Sample user data
  const users: UserLog[] = [
    { id: 1, name: 'Nikhil Vibhani', initials: 'NV', avatarColor: 'bg-purple-500', hoursLogged: 0, hasLogs: false },
    { id: 2, name: 'Vyas Tejas', initials: 'VT', avatarColor: 'bg-teal-500', hoursLogged: 0, hasLogs: false },
    { id: 3, name: 'Urmil Patel', initials: 'UP', avatarColor: 'bg-blue-500', hoursLogged: 0, hasLogs: false },
  ]

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

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
    const days = []
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div key={day} className="p-2 border border-gray-200 min-h-[120px]">
          <div className={`text-sm font-medium mb-2 ${isCurrentDate(day) ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
            {day}
          </div>
          <div className="space-y-1">
            {users.map(user => (
              <div key={`${day}-${user.id}`} className="bg-pink-100 border border-pink-200 rounded p-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full ${user.avatarColor} text-white text-xs flex items-center justify-center font-medium`}>
                    {user.initials}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-gray-600">
                      {user.hasLogs ? `${user.hoursLogged}h logged` : '0h (no logs)'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    return days
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('daily')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'daily'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Daily View
            </button>
            <button
              onClick={() => setActiveTab('jira-users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jira-users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Jira Users
            </button>
            <button
              onClick={() => setActiveTab('my-team')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-team'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Team
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'daily' && (
          <div className="space-y-6">
            {/* Daily View Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h1 className="text-2xl font-bold text-gray-900">Daily View</h1>
              </div>
              
              {/* Toggle Buttons */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Show:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowMissingHours(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      showMissingHours
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Missing Hours (&lt;8h)
                  </button>
                  <button
                    onClick={() => setShowMissingHours(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      !showMissingHours
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Logged Hours (≥8h)
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Navigation and Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-md hover:bg-gray-100"
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
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex space-x-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
                    Refresh Data
                  </button>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium">
                    Trigger Log Reminder
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {renderCalendar()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jira-users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Jira Users</h2>
            <p className="text-gray-600">Jira Users content will go here.</p>
          </div>
        )}

        {activeTab === 'my-team' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Team</h2>
            <p className="text-gray-600">My Team content will go here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
