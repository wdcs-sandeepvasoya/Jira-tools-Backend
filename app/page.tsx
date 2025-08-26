import Link from 'next/link'
import { getCurrentUser } from '@/utils/server-auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to Jira Tools Backend
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A comprehensive platform for managing users, teams, and Jira integrations
        </p>
        
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            Welcome back, <span className="font-semibold">{user.displayName}</span>!
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/users"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Manage Users
            </Link>
            <Link
              href="/teams"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Manage Teams
            </Link>
            <Link
              href="/myteams"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              My Teams
            </Link>
            <Link
              href="/daily-view"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Calendar View
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
