// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
export const NODE_API_BASE_URL = process.env.NEXT_PUBLIC_NODE_API_URL || 'http://localhost:3000'
export const JIRA_BASE_URL = process.env.NEXT_PUBLIC_JIRA_URL || 'https://wdcsgroup.atlassian.net'

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/users/auth/login`,
    REGISTER: `${API_BASE_URL}/api/users/auth/register`,
    LOGOUT: `${API_BASE_URL}/api/users/auth/logout`,
  },
  
  // User endpoints
  USERS: {
    LIST: `${API_BASE_URL}/api/users`,
    CREATE: `${API_BASE_URL}/api/users`,
    GET: (id: number) => `${API_BASE_URL}/api/users/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/api/users/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/api/users/${id}`,
  },
  
  // Jira endpoints
  JIRA: {
    IMPORT_USERS: `${JIRA_BASE_URL}/rest/api/3/users/search?startAt=0&maxResults=50`,
    SEARCH_WORKLOGS: `${API_BASE_URL}/api/jira/search-worklogs`,
    BROWSE_TICKET: (ticketId: string) => `${JIRA_BASE_URL}/browse/${ticketId}`,
  },
  
  // Node.js API endpoints
  NODE_API: {
    IMPORT_USERS: `${NODE_API_BASE_URL}/api/users/import`,
    MY_TEAMS_TEAMS_DATA: `${NODE_API_BASE_URL}/api/myteams/teams-data`,
    SEND_EMAILS: `${NODE_API_BASE_URL}/api/email/send-emails`,
  },
  
  // Team endpoints
  TEAMS: {
    LIST: `${API_BASE_URL}/api/teams/list`,
    CREATE: `${API_BASE_URL}/api/teams`,
    GET: (id: number) => `${API_BASE_URL}/api/teams/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/api/teams/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/api/teams/${id}`,
  },
  
  // My Teams endpoints
  MY_TEAMS: {
    LIST: `${API_BASE_URL}/api/myteams`,
    CREATE: `${API_BASE_URL}/api/myteams`,
    TEAMS_BY_USER: `${API_BASE_URL}/api/myteams/teams-by-user`,
    ADD_USER: `${API_BASE_URL}/api/myteams/add-user`,
    ASSIGN_BY_USER: `${API_BASE_URL}/api/myteams/assign-by-user`,
    DELETE_USER_FROM_TEAM: `${API_BASE_URL}/api/myteams/delete-assign-by-user`,
  },
}
