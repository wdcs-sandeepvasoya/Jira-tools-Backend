import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
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

    // Temporary placeholder response until database is set up
    const newTeam = {
      id: Math.floor(Math.random() * 1000) + 3, // Generate a random ID
      name: trimmedName,
      description: description?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newTeam,
      message: 'Team created successfully'
    })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create team' },
      { status: 500 }
    )
  }
}
