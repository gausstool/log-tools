<script setup lang="ts">
import { useLogStore } from '../store'
import { LOG_LEVELS } from '../types'

const store = useLogStore()

const levelColors: Record<string, string> = {
  DEBUG: 'bg-vs-green',
  INFO: 'bg-vs-blue',
  WARN: 'bg-vs-yellow',
  ERROR: 'bg-vs-red',
  FATAL: 'bg-vs-orange',
}
</script>

<template>
  <div
    v-if="store.stats.value.total > 0"
    class="flex items-center gap-3 px-3 py-0.5 text-xs bg-vs-panel border-t border-vs-border text-vs-muted select-none leading-5"
  >
    <span>总计 <strong class="text-vs-text">{{ store.stats.value.total }}</strong> 条</span>
    <span v-if="store.stats.value.filtered !== store.stats.value.total">
      已筛选 <strong class="text-vs-text">{{ store.stats.value.filtered }}</strong> 条
    </span>

    <div class="flex items-center gap-0.5 flex-1 h-1.5 max-w-72 overflow-hidden">
      <div
        v-for="level in LOG_LEVELS"
        :key="level"
        :title="`${level}: ${store.stats.value.levelCounts[level]}`"
        class="h-full transition-all"
        :class="levelColors[level]"
        :style="{ width: (store.stats.value.levelCounts[level] / Math.max(store.stats.value.total, 1)) * 100 + '%' }"
      />
    </div>

    <span
      v-for="level in LOG_LEVELS"
      :key="level"
      class="whitespace-nowrap"
    >
      {{ level }}={{ store.stats.value.levelCounts[level] }}
    </span>
  </div>
</template>
