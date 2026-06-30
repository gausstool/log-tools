import type { LogEntry, LogLevel, FieldMapping } from './types'
import { LOG_LEVELS } from './types'

// ─── JSONL ──────────────────────────────────────────────

const LEVEL_CANDIDATES = ['level', 'severity', 'log_level', 'loglevel', 'sev']
const TIMESTAMP_CANDIDATES = ['timestamp', '@timestamp', 'time', 'datetime', 'date', 'ts']
const MESSAGE_CANDIDATES = ['message', 'msg', 'log', 'content', 'text', 'body']

function findField(obj: Record<string, unknown>, candidates: string[]): string | null {
  const lowerKeys = Object.fromEntries(
    Object.keys(obj).map(k => [k.toLowerCase(), k])
  )
  for (const c of candidates) {
    if (lowerKeys[c]) return lowerKeys[c]
  }
  return null
}

function normalizeLevel(raw: unknown): LogLevel {
  const s = String(raw).toUpperCase().trim()
  if (LOG_LEVELS.includes(s as LogLevel)) return s as LogLevel
  if (s === 'WARNING') return 'WARN'
  if (s === 'FATAL' || s === 'CRITICAL' || s === 'CRIT') return 'FATAL'
  return 'INFO'
}

function detectFields(samples: Record<string, unknown>[]): FieldMapping {
  const mapping: FieldMapping = { timestamp: 'timestamp', level: 'level', message: 'message' }

  for (const obj of samples) {
    const tsField = findField(obj, TIMESTAMP_CANDIDATES)
    if (tsField) mapping.timestamp = tsField
    const lvField = findField(obj, LEVEL_CANDIDATES)
    if (lvField) mapping.level = lvField
    const msgField = findField(obj, MESSAGE_CANDIDATES)
    if (msgField) mapping.message = msgField
  }
  return mapping
}

function parseJSONL(text: string): LogEntry[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length === 0) return []

  const parsedObjects: Record<string, unknown>[] = []
  for (const line of lines) {
    try {
      const obj = JSON.parse(line)
      if (typeof obj === 'object' && obj !== null) {
        parsedObjects.push(obj as Record<string, unknown>)
      }
    } catch { /* skip */ }
  }
  if (parsedObjects.length === 0) return []

  const mapping = detectFields(parsedObjects.slice(0, 10))

  return parsedObjects.map((obj) => {
    const level = normalizeLevel(obj[mapping.level])
    const timestamp = String(obj[mapping.timestamp] ?? '').trim()
    const message = String(obj[mapping.message] ?? JSON.stringify(obj)).trim()
    return { timestamp, level, message, raw: obj }
  })
}

// ─── Nginx Access Log ────────────────────────────────────

const NGINX_RE = [
  // Combined:   ... "referer" "user-agent" + optional extra fields
  /^(\S+)\s+-\s+(\S+)\s+\[([^\]]+)\]\s+"([^"]*)"\s+(\d{3})\s+(\d+|-)\s+"([^"]*)"\s+"([^"]*)"(?:\s+"[^"]*")*/,
  // Common CLF: no referer, no user-agent
  /^(\S+)\s+-\s+(\S+)\s+\[([^\]]+)\]\s+"([^"]*)"\s+(\d{3})\s+(\d+|-)$/,
]

function statusToLevel(status: number): LogLevel {
  if (status >= 500) return 'ERROR'
  if (status >= 400) return 'WARN'
  return 'INFO'
}

function parseNginxLine(line: string): LogEntry | null {
  let m: RegExpMatchArray | null = null
  let matchedIdx = -1
  for (let i = 0; i < NGINX_RE.length; i++) {
    m = line.match(NGINX_RE[i])
    if (m) {
      matchedIdx = i
      break
    }
  }
  if (!m) return null

  const [, remoteAddr, remoteUser, timeLocal, request, statusStr, bodyBytes, referer, userAgent] = m
  const status = parseInt(statusStr, 10)
  const level = statusToLevel(status)

  const raw: Record<string, unknown> = {
    remote_addr: remoteAddr,
    remote_user: remoteUser,
    time_local: timeLocal,
    request,
    status,
    body_bytes_sent: bodyBytes === '-' || bodyBytes === undefined ? 0 : parseInt(bodyBytes, 10),
  }
  if (matchedIdx === 0) {
    raw.http_referer = referer
    raw.http_user_agent = userAgent
  }

  return {
    timestamp: timeLocal,
    level,
    message: `${request} ${status}`,
    raw,
  }
}

// ─── Auto-detect & dispatch ─────────────────────────────

function detectFormat(lines: string[]): 'jsonl' | 'nginx' | 'plain' {
  const sample = lines.slice(0, 20)
  let jsonlScore = 0
  let nginxScore = 0

  for (const line of sample) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(trimmed)
        jsonlScore++
      } catch {
        jsonlScore -= 1
      }
    }
    if (NGINX_RE.some(re => re.test(trimmed))) {
      nginxScore++
    }
  }

  if (jsonlScore > nginxScore && jsonlScore >= sample.length * 0.3) return 'jsonl'
  if (nginxScore > jsonlScore && nginxScore >= sample.length * 0.3) return 'nginx'
  return 'plain'
}

function parsePlain(lines: string[]): LogEntry[] {
  return lines.map((line, i) => ({
    timestamp: '',
    level: 'INFO' as LogLevel,
    message: line,
    raw: { line_number: i + 1, text: line },
  }))
}

export function parse(text: string): LogEntry[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length === 0) return []

  const format = detectFormat(lines)

  switch (format) {
    case 'jsonl':
      return parseJSONL(text)
    case 'nginx': {
      const entries: LogEntry[] = []
      for (const line of lines) {
        const entry = parseNginxLine(line)
        if (entry) entries.push(entry)
      }
      if (entries.length === 0) return parsePlain(lines)
      return entries
    }
    case 'plain':
      return parsePlain(lines)
  }
}
