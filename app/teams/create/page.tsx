'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TeamForm from '@/components/forms/TeamForm'
import { useAuth } from '@/utils/auth'

export default function CreateTeamPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Create Team</h1>
      </div>
      
      <TeamForm mode="create" />
    </div>
  )
}
