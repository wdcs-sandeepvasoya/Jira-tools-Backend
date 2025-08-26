import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/utils/server-auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const jiraBaseUrl = process.env.JIRA_BASE_URL
    const jiraEmail = process.env.JIRA_EMAIL
    const jiraApiToken = process.env.JIRA_API_TOKEN

    if (!jiraBaseUrl || !jiraEmail || !jiraApiToken) {
      return NextResponse.json(
        { error: 'Jira configuration is missing' },
        { status: 500 }
      )
    }

    // Get search parameters from URL query string
    const { searchParams } = new URL(request.url)
    const jql = searchParams.get('jql')
    const fields = searchParams.get('fields') || 'key,summary'
    const maxResults = searchParams.get('maxResults') || '10000'

    if (!jql) {
      return NextResponse.json(
        { error: 'Missing required parameter: jql' },
        { status: 400 }
      )
    }

    // Build URL with query parameters
    const url = new URL(`${jiraBaseUrl}/rest/api/3/search`)
    url.searchParams.set('jql', jql)
    url.searchParams.set('fields', fields)
    url.searchParams.set('maxResults', maxResults)

    // Fetch worklogs from Jira API
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch worklogs from Jira' },
        { status: response.status }
      )
    }

    const worklogData = await response.json()

    return NextResponse.json(
      { 
        success: true, 
        data: worklogData,
        total: worklogData.total || 0,
        issues: worklogData.issues || []
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Jira worklog search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const jiraBaseUrl = process.env.JIRA_BASE_URL
    const jiraEmail = process.env.JIRA_EMAIL
    const jiraApiToken = process.env.JIRA_API_TOKEN

    if (!jiraBaseUrl || !jiraEmail || !jiraApiToken) {
      return NextResponse.json(
        { error: 'Jira configuration is missing' },
        { status: 500 }
      )
    }

    // Get search parameters from request body
    const body = await request.json()
    const { 
      worklogAuthor, 
      startDate, 
      endDate, 
      fields = 'key,summary',
      maxResults = 10000 
    } = body

    if (!worklogAuthor || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: worklogAuthor, startDate, endDate' },
        { status: 400 }
      )
    }

    // Build JQL query
    const jql = `worklogAuthor = "${worklogAuthor}" AND worklogDate >= "${startDate}" AND worklogDate <= "${endDate}"`
    
    // Build URL with query parameters
    const url = new URL(`${jiraBaseUrl}/rest/api/3/search`)
    url.searchParams.set('jql', jql)
    url.searchParams.set('fields', fields)
    url.searchParams.set('maxResults', maxResults.toString())

    // Fetch worklogs from Jira API
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch worklogs from Jira' },
        { status: response.status }
      )
    }

    const worklogData = await response.json()

    return NextResponse.json(
      { 
        success: true, 
        data: worklogData,
        total: worklogData.total || 0,
        issues: worklogData.issues || []
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Jira worklog search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
