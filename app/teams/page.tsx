'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TeamTable from '@/components/tables/TeamTable'
import { useEffect } from 'react'
import { useAuth } from '@/utils/auth'

export default function TeamsPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Don't render anything while redirecting
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
        <div className="flex space-x-4">
          <Link
            href="/teams/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Add Team
          </Link>
        </div>
      </div>
      
      <TeamTable />
    </div>
  )
}
