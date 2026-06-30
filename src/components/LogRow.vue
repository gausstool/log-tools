<script setup lang="ts">
import type { LogEntry } from '../types'

defineProps<{
  entry: LogEntry
  search: string
  selected: boolean
}>()

defineEmits<{
  select: []
}>()

function highlight(text: string, query: string): string {
  if (!query) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${escaped})`, 'gi')
  return text.replace(re, '<mark class="bg-vs-yellow/30 text-vs-text px-0.5">$1</mark>')
}

const levelColors: Record<string, string> = {
  DEBUG: 'text-vs-green',
  INFO: 'text-vs-blue',
  WARN: 'text-vs-yellow',
  ERROR: 'text-vs-red',
  FATAL: 'text-vs-orange font-bold',
}
</script>

<template>
  <div
    class="flex items-start gap-2 px-4 py-0 text-xs leading-6 border-b border-vs-border/20 hover:bg-vs-hover cursor-pointer font-mono"
    :class="{ 'bg-vs-selection!': selected }"
    @click="$emit('select')"
  >
    <span class="text-vs-dim whitespace-nowrap min-w-36">{{ entry.timestamp }}</span>
    <span
      class="font-semibold whitespace-nowrap min-w-14"
      :class="levelColors[entry.level]"
    >
      {{ entry.level }}
    </span>
    <span
      class="flex-1 min-w-0 truncate"
      v-html="highlight(entry.message, search)"
    />
  </div>
</template>
