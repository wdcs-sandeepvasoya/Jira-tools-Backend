'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { API_ENDPOINTS } from '@/lib/config'
import { authenticatedFetch, getUser } from '@/utils/auth'

// Zod schema for team form validation
const teamFormSchema = z.object({
  name: z.string()
    .min(2, 'Team name must be at least 2 characters long')
    .max(100, 'Team name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Team name can only contain letters, numbers, spaces, hyphens, and underscores')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .default('')
})

type TeamFormData = z.infer<typeof teamFormSchema>

interface TeamFormProps {
  teamId?: number
  mode: 'create' | 'edit'
}

export default function TeamForm({ teamId, mode }: TeamFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    if (mode === 'edit' && teamId) {
      fetchTeam()
    }
  }, [teamId, mode])

  const fetchTeam = async () => {
    try {
      setLoading(true)
      const response = await authenticatedFetch(API_ENDPOINTS.TEAMS.GET(teamId!), {
        method: 'GET'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setFormData({
            name: data.data.name || '',
            description: data.data.description || ''
          })
        }
      } else {
        setError('Failed to fetch team data')
      }
    } catch (error) {
      setError('An error occurred while fetching team data')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const result = teamFormSchema.safeParse(formData)
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
    
    // Clear previous errors
    setError('')
    setValidationErrors({})

    // Validate form
    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      const endpoint = mode === 'create' 
        ? API_ENDPOINTS.TEAMS.CREATE 
        : API_ENDPOINTS.TEAMS.UPDATE(teamId!)
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      // Get current user for userId
      const currentUser = getUser()
      if (!currentUser?.id) {
        setError('User not authenticated')
        return
      }

      const requestData = mode === 'create' 
        ? { ...formData, userId: currentUser.id }
        : formData

      const response = await authenticatedFetch(endpoint, {
        method,
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          router.push('/teams')
        } else {
          setError(data.message || 'Failed to save team')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save team')
      }
    } catch (error) {
      setError('An error occurred while saving team')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof TeamFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Clear general error when user makes changes
    if (error) {
      setError('')
    }
  }

  const getSubmitButtonText = () => {
    if (isSubmitting) {
      return mode === 'create' ? 'Creating Team...' : 'Updating Team...'
    }
    return mode === 'create' ? 'Create Team' : 'Update Team'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {mode === 'create' ? 'Create New Team' : 'Edit Team'}
        </h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Team Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                validationErrors.name 
                  ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter team name (2-100 characters)"
              required
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                validationErrors.description 
                  ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter team description (optional, max 500 characters)"
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.description}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              {getSubmitButtonText()}
            </button>
            <button
              type="button"
              onClick={() => router.push('/teams')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
