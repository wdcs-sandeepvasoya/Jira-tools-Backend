import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/utils/server-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  
    
  
  try {
    // Check authentication
    // const user = await getCurrentUser()
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    //}

    const jiraBaseUrl = process.env.JIRA_BASE_URL
    const jiraEmail = process.env.JIRA_EMAIL
    const jiraApiToken = process.env.JIRA_API_TOKEN

    if (!jiraBaseUrl || !jiraEmail || !jiraApiToken) {
      return NextResponse.json(
        { error: 'Jira configuration is missing' },
        { status: 500 }
      )
    }

    console.log(process.env);
    // Fetch users from Jira API
    const response = await fetch(`${jiraBaseUrl}/rest/api/3/users/search?startAt=0&maxResults=5000`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch users from Jira' },
        { status: response.status }
      )
    }

    const jiraUsers = await response.json()
    let importedCount = 0

    // Process each Jira user
    for (const jiraUser of jiraUsers) {
      try {
        // Check if user already exists by email
        const existingUser = await prisma.user.findUnique({
          where: { email: jiraUser.emailAddress },
        })

        if (existingUser) {
          // Update existing user with Jira data
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              account_id: jiraUser.accountId,
              name: jiraUser.displayName,
              accountType: jiraUser.accountType,
            },
          })
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              account_id: jiraUser.accountId,
              name: jiraUser.displayName,
              email: jiraUser.emailAddress,
              accountType: jiraUser.accountType,
            },
          })
        }
        importedCount++
      } catch (error) {
        console.error(`Error processing user ${jiraUser.emailAddress}:`, error)
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        imported: importedCount,
        total: jiraUsers 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Jira import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
