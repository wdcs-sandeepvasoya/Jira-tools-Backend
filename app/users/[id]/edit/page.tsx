import { getCurrentUser } from '@/utils/server-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import UserForm from '@/components/forms/UserForm'

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const userId = parseInt(params.id)
  if (isNaN(userId)) {
    redirect('/users')
  }

  const userToEdit = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      account_id: true,
      accountType: true,
    },
  })

  if (!userToEdit) {
    redirect('/users')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-600 mt-2">Update user information</p>
      </div>
      
      <UserForm user={userToEdit} mode="edit" />
    </div>
  )
}
