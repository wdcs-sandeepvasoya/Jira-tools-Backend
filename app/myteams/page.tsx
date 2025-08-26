import { getCurrentUser } from '@/utils/server-auth'
import { redirect } from 'next/navigation'

export default async function MyTeamsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
        <div className="text-gray-600">
          My Teams functionality coming soon...
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          My Teams Feature
        </h2>
        <p className="text-gray-600">
          This section will allow users to manage their own teams,
          view team members, and handle team-specific operations.
        </p>
      </div>
    </div>
  )
}
