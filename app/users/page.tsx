'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import UserTable from '@/components/tables/UserTable'
import ImportUsersButton from '@/components/ImportUsersButton'
import { useEffect } from 'react'
import { useAuth } from '@/utils/auth'

export default function UsersPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <div className="flex space-x-4">
          <ImportUsersButton />
          {/* <Link
            href="/users/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Add User
          </Link> */}
        </div>
      </div>
      
      <UserTable />
    </div>
  )
}
