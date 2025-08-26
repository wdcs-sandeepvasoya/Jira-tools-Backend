import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// Temporary placeholder data
const placeholderTeams = [
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid team ID' },
        { status: 400 }
      )
    }

    const team = placeholderTeams.find(t => t.id === id)

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: team
    })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid team ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description } = body

    // Server-side validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Team name is required' },
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

    // Find the team in placeholder data
    const teamIndex = placeholderTeams.findIndex(t => t.id === id)

    if (teamIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    // Update the team
    const updatedTeam = {
      ...placeholderTeams[teamIndex],
      name: trimmedName,
      description: description?.trim() || null,
      updatedAt: new Date().toISOString()
    }

    placeholderTeams[teamIndex] = updatedTeam

    return NextResponse.json({
      success: true,
      data: updatedTeam,
      message: 'Team updated successfully'
    })
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update team' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid team ID' },
        { status: 400 }
      )
    }

    // Find the team in placeholder data
    const teamIndex = placeholderTeams.findIndex(t => t.id === id)

    if (teamIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      )
    }

    // Remove the team from placeholder data
    placeholderTeams.splice(teamIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete team' },
      { status: 500 }
    )
  }
}
