<script setup lang="ts">
import { useLogStore } from '../store'
import { LOG_LEVELS } from '../types'

defineProps<{
  onOpenFile: () => void
}>()

const store = useLogStore()

const levelColors: Record<string, string> = {
  DEBUG: 'text-vs-green',
  INFO: 'text-vs-blue',
  WARN: 'text-vs-yellow',
  ERROR: 'text-vs-red',
  FATAL: 'text-vs-orange font-bold',
}
</script>

<template>
  <div class="flex items-center gap-0 px-2 py-1 bg-vs-panel border-b border-vs-border select-none text-xs">
    <button
      class="px-2 py-0.5 text-vs-text bg-transparent hover:bg-vs-hover active:bg-vs-active cursor-pointer border-none select-none leading-6"
      @click="onOpenFile"
    >
      + 打开日志
    </button>

    <div class="w-px h-4 mx-2 bg-vs-border" />

    <button
      v-for="level in LOG_LEVELS"
      :key="level"
      class="px-2 py-0.5 bg-transparent hover:bg-vs-hover active:bg-vs-active cursor-pointer border-none select-none leading-6"
      :class="levelColors[level]"
      @click="store.toggleLevel(level)"
    >
      <span class="opacity-50 mr-0.5 font-mono">{{ store.stats.value.levelCounts[level] }}</span>
      <span v-if="store.filter.value.levels.includes(level)">● </span>
      <span v-else class="opacity-40">○ </span>
      {{ level }}
    </button>

    <input
      type="text"
      placeholder="筛选日志…"
      class="px-2 py-0.5 text-xs bg-vs-input text-vs-text border border-vs-border border-solid outline-none transition-colors focus:border-vs-focus placeholder:text-vs-dim leading-6 flex-1 ml-2"
      :value="store.filter.value.search"
      @input="store.setSearch(($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
