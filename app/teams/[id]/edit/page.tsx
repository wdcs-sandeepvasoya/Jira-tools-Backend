'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TeamForm from '@/components/forms/TeamForm'
import { useAuth } from '@/utils/auth'

interface EditTeamPageProps {
  params: {
    id: string
  }
}

export default function EditTeamPage({ params }: EditTeamPageProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const teamId = parseInt(params.id)

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

  if (isNaN(teamId)) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Invalid team ID
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Edit Team</h1>
      </div>
      
      <TeamForm mode="edit" teamId={teamId} />
    </div>
  )
}
