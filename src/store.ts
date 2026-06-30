import { reactive, computed } from 'vue'
import type { LogEntry, LogLevel, LogStats, FilterState } from './types'
import { LOG_LEVELS } from './types'

interface Store {
  entries: LogEntry[]
  filter: FilterState
  selectedEntry: LogEntry | null
}

const store = reactive<Store>({
  entries: [],
  filter: {
    levels: [...LOG_LEVELS],
    search: '',
  },
  selectedEntry: null,
})

export function useLogStore() {
  function setEntries(entries: LogEntry[]) {
    store.entries = entries
    store.selectedEntry = null
  }

  function setLevelFilter(levels: LogLevel[]) {
    store.filter.levels = levels
  }

  function toggleLevel(level: LogLevel) {
    const idx = store.filter.levels.indexOf(level)
    if (idx >= 0) {
      if (store.filter.levels.length > 1) {
        store.filter.levels.splice(idx, 1)
      }
    } else {
      store.filter.levels.push(level)
    }
  }

  function setSearch(search: string) {
    store.filter.search = search
  }

  function selectEntry(entry: LogEntry | null) {
    store.selectedEntry = entry
  }

  const filteredEntries = computed(() => {
    return store.entries.filter((entry) => {
      if (!store.filter.levels.includes(entry.level)) return false
      if (store.filter.search) {
        const q = store.filter.search.toLowerCase()
        const matchesMessage = entry.message.toLowerCase().includes(q)
        const matchesTimestamp = entry.timestamp.toLowerCase().includes(q)
        const matchesRaw = JSON.stringify(entry.raw).toLowerCase().includes(q)
        if (!matchesMessage && !matchesTimestamp && !matchesRaw) return false
      }
      return true
    })
  })

  const stats = computed<LogStats>(() => {
    const levelCounts: Record<LogLevel, number> = {
      DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, FATAL: 0,
    }
    for (const entry of store.entries) {
      levelCounts[entry.level]++
    }
    return {
      total: store.entries.length,
      filtered: filteredEntries.value.length,
      levelCounts,
    }
  })

  return {
    entries: computed(() => store.entries),
    filter: computed(() => store.filter),
    filteredEntries,
    stats,
    selectedEntry: computed(() => store.selectedEntry),
    setEntries,
    setLevelFilter,
    toggleLevel,
    setSearch,
    selectEntry,
  }
}
