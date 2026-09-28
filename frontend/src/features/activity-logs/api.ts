import { apiRequest } from '@/lib/api'

export type ActivityLog = {
  id: string
  user: string
  action: 'create' | 'update' | 'delete'
  model_name: string
  object_id: string
  timestamp: string
}

export type ActivityLogQuery = {
  action?: string
  model_name?: string
  username?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export type ActivityLogPage = {
  count: number
  next: string | null
  previous: string | null
  results: ActivityLog[]
}

export function getActivityLogs(query: ActivityLogQuery) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }

  return apiRequest<ActivityLogPage>(`/api/v1/activity-logs/?${params.toString()}`)
}