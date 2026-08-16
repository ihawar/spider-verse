export interface User {
  id: string
  username: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Topic {
  id: string
  name: string
  emoji: string
  createdAt: string
  tasks?: Task[]
  _count?: { sessions: number }
}

export interface Task {
  id: string
  title: string
  completed: boolean
  topicId: string
  topic?: Topic
  createdAt: string
}

export interface Session {
  id: string
  topicId: string
  topic: Topic
  startTime: string
  endTime: string
  duration: number
  createdAt: string
}

export interface AnalyticsBreakdown {
  topicId: string
  topicName: string
  emoji: string
  totalSeconds: number
}

export interface DailyBreakdown {
  date: string
  label: string
  totalSeconds: number
}

export interface AnalyticsSummary {
  totalHours: number
  totalSessions: number
  topTopic: string
  longestSession: number
  tasksCompleted: number
}

export interface Analytics {
  summary: AnalyticsSummary
  breakdowns: AnalyticsBreakdown[]
  dailyBreakdown: DailyBreakdown[]
}

export type Period = 'weekly' | 'monthly' | 'all'

export interface PomodoroSettings {
  pomodoroEnabled: boolean
  pomodoroFocusMinutes: number
  pomodoroBreakMinutes: number
}
