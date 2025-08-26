'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '@/lib/config'
import { getUser, removeAuth, authenticatedFetch } from '@/utils/auth'

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in by looking for token and user data
    const userData = getUser()
    if (userData) {
      setUser(userData)
    }
    setLoading(false)

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      const userData = getUser()
      setUser(userData)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = async () => {
    try {
      await authenticatedFetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      })
      removeAuth()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if API call fails, clear local auth
      removeAuth()
      setUser(null)
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                Jira Tools
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Jira Tools
            </Link>
            
            {user && (
              <>
                <Link
                  href="/users"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Users Management
                </Link>
                <Link
                  href="/teams"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Teams Management
                </Link>
                <Link
                  href="/daily-view"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Calendar View
                </Link>
                {/* <Link
                  href="/myteams"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Teams
                </Link> */}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700 text-sm">
                  Welcome, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                {/* <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link> */}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
