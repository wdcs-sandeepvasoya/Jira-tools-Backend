'use client'

import { useState } from 'react'
import { API_ENDPOINTS } from '@/lib/config'
import { authenticatedFetch } from '@/utils/auth'

interface JiraUser {
  self: string
  accountId: string
  accountType: string
  displayName: string
  active: boolean
  timeZone?: string
  locale?: string
  avatarUrls?: {
    '48x48': string
    '24x24': string
    '16x16': string
    '32x32': string
  }
}

export default function ImportUsersButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleImport = async () => {
    setLoading(true)
    setMessage('')
  
    try {
      const jiraEmail = process.env.NEXT_PUBLIC_JIRA_EMAIL
      const jiraApiToken = process.env.NEXT_PUBLIC_JIRA_API_TOKEN
      
      if (!jiraEmail || !jiraApiToken) {
        setMessage('Jira credentials not configured')
        return
      }
      
      const authString = btoa(`${jiraEmail}:${jiraApiToken}`)
  
      // First, fetch users from Jira
      const jiraResponse = await fetch('/api/jira/import-users', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Accept': 'application/json'
        }
      })
  
      const jiraData = await jiraResponse.json()
  
      if (jiraResponse.ok) {
        // Process the total array to extract required fields
        if (jiraData.total && Array.isArray(jiraData.total)) {
          const processedUsers = jiraData.total.map((user: JiraUser) => ({
            name: user.displayName,
            avatar_url: user.avatarUrls?.['24x24'] || '',
            account_id: user.accountId,
            account_type: user.accountType,
            role_id: 2
          }))
          
          
          // Now send the processed users to the Node.js API
          const importResponse = await authenticatedFetch(API_ENDPOINTS.NODE_API.IMPORT_USERS, {
            method: 'POST',
            headers: {
              'Accept': 'application/json'
            },
            body: JSON.stringify(processedUsers)
          })
          
          const importData = await importResponse.json()
          
          if (importResponse.ok) {
            setMessage(`Successfully imported ${processedUsers.length} users to the database!`)
            setTimeout(() => {
              window.location.reload()
            }, 1000)
          } else {
            setMessage(importData.error || 'Failed to import users to database')
          }
        } else {
          setMessage(`Successfully processed ${jiraData.imported} users from Jira!`)
        }
      } else {
        setMessage(jiraData.error || 'Import failed')
      }
    } catch (error) {
      console.error('Import error:', error)
      setMessage('An error occurred during import')
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="relative">
      <button
        onClick={handleImport}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Importing...' : 'Import from Jira'}
      </button>
      
      {message && (
        <div className={`absolute top-full left-0 mt-2 px-4 py-2 rounded-md text-sm ${
          message.includes('Successfully') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}
