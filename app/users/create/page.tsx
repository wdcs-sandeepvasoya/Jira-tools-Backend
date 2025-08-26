import { getCurrentUser } from '@/utils/server-auth'
import { redirect } from 'next/navigation'
import UserForm from '@/components/forms/UserForm'

export default async function CreateUserPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
        <p className="text-gray-600 mt-2">Add a new user to the system</p>
      </div>
      
      <UserForm />
    </div>
  )
}
