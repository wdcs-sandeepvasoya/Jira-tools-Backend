import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Temporary placeholder data until database is set up
    const teams = [
      {
        id: 1,
        name: 'Development Team',
        description: 'Main development team for the project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'QA Team',
        description: 'Quality assurance team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    return NextResponse.json({
      success: true,
      data: teams
    })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if this is a pagination request or team creation request
    if (body.page !== undefined || body.limit !== undefined || body.search !== undefined || body.sort !== undefined) {
      // This is a pagination request
      const { page = 1, limit = 10, search = '', sort = { field: 'createdAt', direction: 'desc' } } = body

      // Temporary placeholder data until database is set up
      const allTeams = [
        {
          id: 1,
          name: 'Development Team',
          description: 'Main development team for the project',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'QA Team',
          description: 'Quality assurance team',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Design Team',
          description: 'UI/UX design team',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Marketing Team',
          description: 'Digital marketing and content team',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 5,
          name: 'DevOps Team',
          description: 'Infrastructure and deployment team',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      // Simple search implementation
      let filteredTeams = allTeams
      if (search && search.trim()) {
        const searchLower = search.toLowerCase()
        filteredTeams = allTeams.filter(team => 
          team.name.toLowerCase().includes(searchLower) ||
          (team.description && team.description.toLowerCase().includes(searchLower))
        )
      }

      // Simple sorting implementation
      if (sort.field && sort.direction) {
        filteredTeams.sort((a, b) => {
          const aValue = a[sort.field as keyof typeof a]
          const bValue = b[sort.field as keyof typeof b]
          
          if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
          if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
          return 0
        })
      }

      // Pagination
      const total = filteredTeams.length
      const skip = (page - 1) * limit
      const totalPages = Math.ceil(total / limit)
      const paginatedTeams = filteredTeams.slice(skip, skip + limit)

      return NextResponse.json({
        success: true,
        data: paginatedTeams,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          itemsPerPage: limit
        }
      })
    } else {
      // This is a team creation request
      const { name, description, userId } = body

      // Server-side validation
      if (!name || !name.trim()) {
        return NextResponse.json(
          { success: false, message: 'Team name is required' },
          { status: 400 }
        )
      }

      if (!userId) {
        return NextResponse.json(
          { success: false, message: 'User ID is required' },
          { status: 400 }
        )
      }

      const trimmedName = name.trim()
      
      if (trimmedName.length < 2) {
        return NextResponse.json(
          { success: false, message: 'Team name must be at least 2 characters long' },
          { status: 400 }
        )
      }

      if (trimmedName.length > 100) {
        return NextResponse.json(
          { success: false, message: 'Team name must be less than 100 characters' },
          { status: 400 }
        )
      }

      // Validate name format (letters, numbers, spaces, hyphens, underscores only)
      if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
        return NextResponse.json(
          { success: false, message: 'Team name can only contain letters, numbers, spaces, hyphens, and underscores' },
          { status: 400 }
        )
      }

      // Validate description length if provided
      if (description && description.trim().length > 500) {
        return NextResponse.json(
          { success: false, message: 'Description must be less than 500 characters' },
          { status: 400 }
        )
      }

      // Temporary placeholder response until database is set up
      const newTeam = {
        id: Math.floor(Math.random() * 1000) + 3, // Generate a random ID
        name: trimmedName,
        description: description?.trim() || null,
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: newTeam,
        message: 'Team created successfully'
      })
    }
  } catch (error) {
    console.error('Error in teams API:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    )
  }
}
