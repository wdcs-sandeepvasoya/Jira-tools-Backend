'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { API_ENDPOINTS } from '@/lib/config'
import { authenticatedFetch } from '@/utils/auth'
import { AutoSuggestInput } from '@/components/AutoSuggestInput'

interface User {
  id: number
  name: string
  email: string
  accountId: string | null
  accountType: string | null
  createdAt: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

type SortField = 'name' | 'email' | 'accountId' | 'accountType' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userTeams, setUserTeams] = useState<any[]>([])
  const [assignedTeams, setAssignedTeams] = useState<any[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [addingToTeam, setAddingToTeam] = useState(false)
  const [showAddToTeamSection, setShowAddToTeamSection] = useState(true)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [pagination.currentPage, pagination.itemsPerPage, debouncedSearch, sortField, sortDirection])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const payload = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: debouncedSearch,
        sort: {
          field: sortField,
          direction: sortDirection
        }
      }

      const response = await authenticatedFetch(API_ENDPOINTS.USERS.LIST, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        const responseData = await response.json()
        
        if (responseData.success && Array.isArray(responseData.data)) {
          setUsers(responseData.data)
          // Update pagination info if provided in response
          if (responseData.pagination) {
            setPagination(prev => ({
              ...prev,
              totalPages: responseData.pagination.totalPages || prev.totalPages,
              totalItems: responseData.pagination.total || prev.totalItems
            }))
          }
        } else {
          console.error('Data is not in expected format:', responseData)
          setError('Invalid data format received')
        }
      } else {
        const errorData = await response.json()
        console.error('API error:', errorData)
        setError('Failed to fetch users')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError('An error occurred while fetching users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const response = await authenticatedFetch(API_ENDPOINTS.USERS.DELETE(userId), {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId))
        // Refresh the list to update pagination
        fetchUsers()
      } else {
        setError('Failed to delete user')
      }
    } catch (error) {
      setError('An error occurred while deleting user')
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, itemsPerPage: limit, currentPage: 1 }))
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleAddToTeam = async (user: User) => {
    setSelectedUser(user)
    setSidebarOpen(true)
    setInputValue('') // Reset input value when opening sidebar
    setShowSuccessMessage(false) // Reset success message
    await fetchUserTeams(user.id)
  }

  const fetchUserTeams = async (userId: number) => {
    try {
      setLoadingTeams(true)
      
      // First API call: Get available teams for user
      const teamsResponse = await authenticatedFetch(API_ENDPOINTS.MY_TEAMS.TEAMS_BY_USER, {
        method: 'POST',
        body: JSON.stringify({ userId })
      })
      
      // Second API call: Get already assigned teams for user
      const assignedResponse = await authenticatedFetch(API_ENDPOINTS.MY_TEAMS.ASSIGN_BY_USER, {
        method: 'POST',
        body: JSON.stringify({ userId })
      })
      
      if (teamsResponse.ok && assignedResponse.ok) {
        const teamsData = await teamsResponse.json()
        const assignedData = await assignedResponse.json()
        
        if (teamsData.success && assignedData.success) {
          // Combine both data sets
          const availableTeams = teamsData.data || []
          const assignedTeams = assignedData.data || []
          
          // Set available teams for selection
          setUserTeams(availableTeams)
          
          // Store assigned teams separately
          setAssignedTeams(assignedTeams)
          
          console.log('Available teams:', availableTeams)
          console.log('Assigned teams:', assignedTeams)
          
        } else {
          console.error('Failed to fetch teams data')
          setUserTeams([])
        }
      } else {
        console.error('Failed to fetch teams from one or both APIs')
        setUserTeams([])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      setUserTeams([])
    } finally {
      setLoadingTeams(false)
    }
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
    setSelectedUser(null)
    setSelectedTeam(null)
    setAssignedTeams([])
    setShowAddToTeamSection(true) // Reset to show add to team section when sidebar opens again
    setShowSuccessMessage(false) // Reset success message
    setInputValue('') // Reset input value
  }

  const handleConfirmAddToTeam = async (teamId?: number) => {
    if (!selectedUser) return
    
    try {
      // Add your logic here for adding user to team
      if (teamId) {
        console.log(`Adding user ${selectedUser.id} to team ${teamId}`)
        // You can make an API call here to add the user to a team
        // Example: await authenticatedFetch(`/api/users/${selectedUser.id}/add-to-team`, { method: 'POST', body: JSON.stringify({ teamId }) })
        
        // For now, just show a success message
        alert(`Successfully added user ${selectedUser.name} to team ${teamId}`)
      } else {
        console.log(`Adding user ${selectedUser.id} to team`)
        alert(`Successfully added user ${selectedUser.name} to team`)
      }
      closeSidebar()
    } catch (error) {
      console.error('Error adding user to team:', error)
      alert('Failed to add user to team')
    }
  }

  const handleAddUserToTeam = async () => {
    if (!selectedUser || !selectedTeam) return
    
    try {
      setAddingToTeam(true)
      
      const response = await authenticatedFetch(API_ENDPOINTS.MY_TEAMS.ADD_USER, {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUser.id,
          teamId: selectedTeam.id
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert(`Successfully added ${selectedUser.name} to team ${selectedTeam.name}`)
          
          // Automatically refresh both data sets after successful addition
          if (selectedUser) {
            setLoadingTeams(true) // Show loading state during refresh
            
            try {
              // Refresh available teams
              const teamsResponse = await authenticatedFetch(API_ENDPOINTS.MY_TEAMS.TEAMS_BY_USER, {
                method: 'POST',
                body: JSON.stringify({ userId: selectedUser.id })
              })
              
              // Refresh assigned teams
              const assignedResponse = await authenticatedFetch(API_ENDPOINTS.MY_TEAMS.ASSIGN_BY_USER, {
                method: 'POST',
                body: JSON.stringify({ userId: selectedUser.id })
              })
              
              if (teamsResponse.ok && assignedResponse.ok) {
                const teamsData = await teamsResponse.json()
                const assignedData = await assignedResponse.json()
                
                if (teamsData.success && assignedData.success) {
                  setUserTeams(teamsData.data || [])
                  setAssignedTeams(assignedData.data || [])
                }
              }
            } catch (error) {
              console.error('Error refreshing data after addition:', error)
            } finally {
              setLoadingTeams(false) // Hide loading state
            }
          }
          
          // Update UI state after successful addition
          setAddingToTeam(false) // Reset adding state
          setShowSuccessMessage(true) // Show success message
          setInputValue('') // Clear input value
          setSelectedTeam(null) // Clear selected team
          setAddingToTeam(false) // Reset adding state
          //setShowSuccessMessage(false) // Hide any existing success message
          // Keep selected team and add to team section visible for continued use
        } else {
          alert(`Failed to add user to team: ${data.message}`)
        }
      } else {
        alert('Failed to add user to team')
      }
    } catch (error) {
      console.error('Error adding user to team:', error)
      alert('Failed to add user to team')
    } finally {
      setAddingToTeam(false)
    }
  }

  const handleDeleteTeam = async (teamId: number) => {
    if (!selectedUser) return
    
    if (confirm(`Are you sure you want to remove ${selectedUser.name} from this team?`)) {
      try {
        const response = await authenticatedFetch(API_ENDPOINTS.MY_TEAMS.DELETE_USER_FROM_TEAM, {
          method: 'POST',
          body: JSON.stringify({
            userId: selectedUser.id,
            teamId: teamId
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            alert(`Successfully removed ${selectedUser.name} from team`)
            
            // Automatically refresh both data sets after successful deletion
            if (selectedUser) {
              setLoadingTeams(true) // Show loading state during refresh
              
              try {
                // Refresh available teams
                const teamsResponse = await authenticatedFetch(API_ENDPOINTS.MY_TEAMS.TEAMS_BY_USER, {
                  method: 'POST',
                  body: JSON.stringify({ userId: selectedUser.id })
                })
                
                // Refresh assigned teams
                const assignedResponse = await authenticatedFetch(API_ENDPOINTS.MY_TEAMS.ASSIGN_BY_USER, {
                  method: 'POST',
                  body: JSON.stringify({ userId: selectedUser.id })
                })
                
                if (teamsResponse.ok && assignedResponse.ok) {
                  const teamsData = await teamsResponse.json()
                  const assignedData = await assignedResponse.json()
                  
                  if (teamsData.success && assignedData.success) {
                    setUserTeams(teamsData.data || [])
                    setAssignedTeams(assignedData.data || [])
                  }
                }
                          } catch (error) {
              console.error('Error refreshing data after deletion:', error)
            } finally {
              setLoadingTeams(false) // Hide loading state
            }
          }
          
          // Reset UI state after successful deletion to allow new team selections
          setSelectedTeam(null) // Clear selected team
          setAddingToTeam(false) // Reset adding state
          setInputValue('') // Clear input value
          setShowSuccessMessage(false) // Hide any existing success message
          } else {
            alert(`Failed to remove user from team: ${data.message}`)
          }
        } else {
          alert('Failed to remove user from team')
        }
      } catch (error) {
        console.error('Error removing user from team:', error)
        alert('Failed to remove user from team')
      }
    }
  }



  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>
    }
    return sortDirection === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <>
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="sm:w-32">
            <select
              value={pagination.itemsPerPage}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  <SortIcon field="email" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('accountId')}
              >
                <div className="flex items-center space-x-1">
                  <span>Account ID</span>
                  <SortIcon field="accountId" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('accountType')}
              >
                <div className="flex items-center space-x-1">
                  <span>Account Type</span>
                  <SortIcon field="accountType" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <SortIcon field="createdAt" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(users) && users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.accountId || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.accountType || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddToTeam(user)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
                    >
                      Add To Team
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {users.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No users found. Create your first user to get started.
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {pagination.totalItems > 0 ? (
                <>
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </>
              ) : (
                'No results found'
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      page === pagination.currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    {/* Sidebar */}
    {sidebarOpen && (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={closeSidebar}
        />
        
        {/* Sidebar */}
        <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
          <div className="w-screen max-w-md">
            <div className="flex h-full flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Add User To Team
                  </h2>
                  <button
                    onClick={closeSidebar}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Close panel</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 py-6 sm:px-6">
                {selectedUser && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">User Details</h3>
                      <div className="mt-2 space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Name</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Account ID</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.accountId || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Account Type</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.accountType || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Created</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(selectedUser.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Add to Team List
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Below are the teams that "{selectedUser.name}" is already a member of. You can add them to new teams or remove them from existing ones.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Select Team</label>
                      
                      {/* AutoSuggest Input for Teams */}
                      <div className="mt-2">
                        <AutoSuggestInput
                          placeholder="Search teams by name..."
                          suggestions={userTeams.map(team => team.name)}
                          value={inputValue}
                          onChange={(value) => setInputValue(value)}
                          onSelect={(teamName) => {
                            const selectedTeam = userTeams.find(team => team.name === teamName)
                            if (selectedTeam) {
                              setSelectedTeam(selectedTeam)
                              setShowSuccessMessage(false) // Hide success message when new team is selected
                            }
                          }}
                        />
                      </div>

                      {/* Add to Team Button */}
                      {showAddToTeamSection && selectedTeam && (
                        <div className="mt-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                            <div className="text-sm text-blue-800">
                              <strong>Selected Team:</strong> {selectedTeam.name}
                              {selectedTeam.description && (
                                <div className="text-blue-600 mt-1">{selectedTeam.description}</div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={handleAddUserToTeam}
                            disabled={addingToTeam}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            {addingToTeam ? 'Adding to Team...' : 'Add to Team'}
                          </button>
                        </div>
                      )}

                      {/* Success Message - Show temporarily after adding user */}
                      {showSuccessMessage && (
                        <div className="mt-4">
                          <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <div className="text-sm text-green-800">
                              <strong>Success!</strong> User has been added to the team. The team lists have been updated below.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Assigned Teams List */}
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Already Assigned Teams</h4>
                        {loadingTeams ? (
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                        ) : assignedTeams.length > 0 ? (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {assignedTeams.map((team) => (
                              <div key={team.id} className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-gray-900">{team.name}</span>
                                      {team.key && (
                                        <span className="text-xs bg-blue-200 text-blue-600 px-2 py-1 rounded">
                                          {team.key}
                                        </span>
                                      )}
                                    </div>
                                    {team.description && (
                                      <div className="text-sm text-gray-600 mt-1">{team.description}</div>
                                    )}
                                    <div className="text-xs text-blue-600 font-medium mt-1">{team.role}</div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteTeam(team.id)}
                                    className="ml-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-4">
                            No assigned teams found for this user
                          </div>
                        )}
                      </div>

                      {/* Available Teams List */}
                   
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-4 py-4 sm:px-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeSidebar}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={closeSidebar}
                    className="rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
