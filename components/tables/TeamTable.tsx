'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { API_ENDPOINTS } from '@/lib/config'
import { authenticatedFetch } from '@/utils/auth'

interface Team {
  id: number
  name: string
  description: string | null
  createdBy: number
  userId: number
  createdAt: string
  creator: {
    id: number
    name: string
    email: string
  }
  owner: {
    id: number
    name: string
    email: string
  }
  members: any[]
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

type SortField = 'name' | 'description' | 'createdAt' | 'creator' | 'owner'
type SortDirection = 'asc' | 'desc'

export default function TeamTable() {
  const [teams, setTeams] = useState<Team[]>([])
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
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  useEffect(() => {
    fetchTeams()
  }, [pagination.currentPage, pagination.itemsPerPage, debouncedSearch, sortField, sortDirection])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const fetchTeams = async () => {
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

      const response = await authenticatedFetch(API_ENDPOINTS.TEAMS.LIST, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        const responseData = await response.json()
        
        if (responseData.success && responseData.data && responseData.data.teams) {
          setTeams(responseData.data.teams)
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
        setError('Failed to fetch teams')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError('An error occurred while fetching teams')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (teamId: number) => {
    if (!confirm('Are you sure you want to delete this team?')) {
      return
    }

    try {
      const response = await authenticatedFetch(API_ENDPOINTS.TEAMS.DELETE(teamId), {
        method: 'DELETE',
      })

      if (response.ok) {
        setTeams(teams.filter(team => team.id !== teamId))
        // Refresh the list to update pagination
        fetchTeams()
      } else {
        setError('Failed to delete team')
      }
    } catch (error) {
      setError('An error occurred while deleting team')
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

  const handleAddToTeam = (team: Team) => {
    setSelectedTeam(team)
    setSidebarOpen(true)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
    setSelectedTeam(null)
  }

  const handleConfirmAddToTeam = async () => {
    if (!selectedTeam) return
    
    try {
      // Add your logic here for adding user to team
      console.log(`Adding user to team ${selectedTeam.id}`)
      // You can make an API call here to add the current user to the team
      // Example: await authenticatedFetch(`/api/teams/${selectedTeam.id}/add-member`, { method: 'POST' })
      
      // For now, just show a success message
      alert(`Successfully added to team ${selectedTeam.name}`)
      closeSidebar()
    } catch (error) {
      console.error('Error adding to team:', error)
      alert('Failed to add to team')
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
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search teams by name or description..."
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
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center space-x-1">
                  <span>Description</span>
                  <SortIcon field="description" />
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
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('creator')}
              >
                <div className="flex items-center space-x-1">
                  <span>Creator</span>
                  <SortIcon field="creator" />
                </div>
              </th>
              {/* <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('owner')}
              >
                <div className="flex items-center space-x-1">
                  <span>Owner</span>
                  <SortIcon field="owner" />
                </div>
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(teams) && teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {team.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {team.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {team.creator?.name}
                  </div>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {team.owner?.name}
                  </div>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {/* <button
                      onClick={() => handleAddToTeam(team.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
                    >
                      Add To Team
                    </button> */}
                    <Link
                      href={`/teams/${team.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {teams.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No teams found. Create your first team to get started.
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
  )
}
