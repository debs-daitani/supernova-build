/**
 * VENUED API Client
 *
 * Connects to SUPERNova API endpoints for data persistence
 * Replace all localStorage calls with these API methods
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_SUPERNOVA_URL || 'http://localhost:3001'

// Types
export interface Project {
  id: string
  title: string
  description?: string
  emoji?: string
  status: 'BACKSTAGE' | 'SETLIST' | 'CREW' | 'TOUR' | 'ENTOURAGE'
  color: string
  archived: boolean
  createdAt: string
  updatedAt: string
  phases?: Phase[]
  tasks?: Task[]
  goals?: Goal[]
}

export interface Task {
  id: string
  projectId: string
  phaseId?: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  completedAt?: string
  points: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Phase {
  id: string
  projectId: string
  name: string
  order: number
  color: string
  startDate?: string
  endDate?: string
  tasks?: Task[]
}

export interface Goal {
  id: string
  projectId: string
  title: string
  description?: string
  targetDate?: string
  completedAt?: string
  progress: number
}

export interface UserStats {
  totalPoints: number
  level: number
  tasksCompleted: number
  currentStreak: number
  longestStreak: number
  lastTaskDate?: string
}

// Error handling
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new APIError(response.status, error.error || 'Request failed')
  }

  return response.json()
}

// SSO Authentication
export async function verifySSOToken(token: string): Promise<{ user: any }> {
  return fetchAPI('/api/auth/verify-sso', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

// Projects API
export async function getProjects(includeArchived = false): Promise<{ projects: Project[] }> {
  const query = includeArchived ? '?includeArchived=true' : ''
  return fetchAPI(`/api/venued/projects${query}`)
}

export async function getProject(id: string): Promise<{ project: Project }> {
  return fetchAPI(`/api/venued/projects/${id}`)
}

export async function createProject(data: {
  title: string
  description?: string
  emoji?: string
  color?: string
  status?: string
}): Promise<{ project: Project }> {
  return fetchAPI('/api/venued/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProject(
  id: string,
  data: Partial<Project>
): Promise<{ project: Project }> {
  return fetchAPI(`/api/venued/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteProject(id: string): Promise<{ success: boolean }> {
  return fetchAPI(`/api/venued/projects/${id}`, {
    method: 'DELETE',
  })
}

// Tasks API
export async function getTasks(filters?: {
  projectId?: string
  phaseId?: string
  status?: string
}): Promise<{ tasks: Task[] }> {
  const params = new URLSearchParams()
  if (filters?.projectId) params.set('projectId', filters.projectId)
  if (filters?.phaseId) params.set('phaseId', filters.phaseId)
  if (filters?.status) params.set('status', filters.status)

  const query = params.toString() ? `?${params.toString()}` : ''
  return fetchAPI(`/api/venued/tasks${query}`)
}

export async function createTask(data: {
  projectId: string
  phaseId?: string
  title: string
  description?: string
  priority?: string
  dueDate?: string
  points?: number
  tags?: string[]
}): Promise<{ task: Task }> {
  return fetchAPI('/api/venued/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateTask(
  id: string,
  data: Partial<Task>
): Promise<{ task: Task }> {
  return fetchAPI(`/api/venued/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function completeTask(id: string): Promise<{ task: Task }> {
  return updateTask(id, { status: 'COMPLETED' })
}

export async function deleteTask(id: string): Promise<{ success: boolean }> {
  return fetchAPI(`/api/venued/tasks/${id}`, {
    method: 'DELETE',
  })
}

// Phases API
export async function getPhases(projectId: string): Promise<{ phases: Phase[] }> {
  return fetchAPI(`/api/venued/phases?projectId=${projectId}`)
}

export async function createPhase(data: {
  projectId: string
  name: string
  color?: string
  startDate?: string
  endDate?: string
}): Promise<{ phase: Phase }> {
  return fetchAPI('/api/venued/phases', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Stats API
export async function getUserStats(): Promise<{
  stats: UserStats
  achievements: any[]
}> {
  return fetchAPI('/api/venued/stats')
}

// Error export
export { APIError }
