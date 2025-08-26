'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { API_ENDPOINTS } from '@/lib/config'

// Zod schema for user form validation
const userFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  account_id: z.string()
    .optional()
    .default(''),
  accountType: z.string()
    .optional()
    .default('')
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserFormProps {
  user?: {
    id: number
    name: string
    email: string
    account_id: string | null
    accountType: string | null
  }
  mode?: 'create' | 'edit'
}

export default function UserForm({ user, mode = 'create' }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    account_id: user?.account_id || '',
    accountType: user?.accountType || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const router = useRouter()

  const validateForm = (): boolean => {
    const result = userFormSchema.safeParse(formData)
    if (result.success) {
      setValidationErrors({})
      return true
    } else {
      const errors: {[key: string]: string} = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        errors[field] = issue.message
      })
      setValidationErrors(errors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    setValidationErrors({})

    // Validate form
    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const url = mode === 'edit' ? API_ENDPOINTS.USERS.UPDATE(user?.id || 0) : API_ENDPOINTS.USERS.CREATE
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(
          mode === 'edit' 
            ? 'User updated successfully!' 
            : 'User created successfully!'
        )
        if (mode === 'create') {
          setTimeout(() => {
            router.push('/users')
          }, 1500)
        }
      } else {
        setError(data.error || 'Operation failed')
      }
    } catch (error) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Clear general error when user makes changes
    if (error) {
      setError('')
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent ${
              validationErrors.name 
                ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="Enter full name"
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600 font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent ${
              validationErrors.email 
                ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="Enter email address"
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600 font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="account_id" className="block text-sm font-medium text-gray-700">
            Account ID
          </label>
          <input
            type="text"
            id="account_id"
            name="account_id"
            value={formData.account_id}
            onChange={handleChange}
            className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent ${
              validationErrors.account_id 
                ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="Enter account ID (optional)"
          />
          {validationErrors.account_id && (
            <p className="mt-1 text-sm text-red-600 font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.account_id}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
            Account Type
          </label>
          <input
            type="text"
            id="accountType"
            name="accountType"
            value={formData.accountType}
            onChange={handleChange}
            className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent ${
              validationErrors.accountType 
                ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="Enter account type (optional)"
          />
          {validationErrors.accountType && (
            <p className="mt-1 text-sm text-red-600 font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.accountType}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? (mode === 'edit' ? 'Updating...' : 'Creating...') 
              : (mode === 'edit' ? 'Update User' : 'Create User')
            }
          </button>
        </div>
      </form>
    </div>
  )
}
