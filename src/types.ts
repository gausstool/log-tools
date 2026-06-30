export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

export const LOG_LEVELS: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  raw: Record<string, unknown>
}

export interface FieldMapping {
  timestamp: string
  level: string
  message: string
}

export interface LogStats {
  total: number
  filtered: number
  levelCounts: Record<LogLevel, number>
}

export interface FilterState {
  levels: LogLevel[]
  search: string
}
