<script setup lang="ts">
import { useLogStore } from '../store'

const store = useLogStore()

function close() {
  store.selectEntry(null)
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
    v-if="store.selectedEntry.value"
    class="w-96 border-l border-vs-border bg-vs-sidebar flex flex-col pb-3"
  >
    <div class="px-3 py-1.5 bg-vs-panel border-b border-vs-border text-xs text-vs-muted select-none">详情</div>

    <div class="flex-1 overflow-auto p-3 space-y-3 text-xs font-mono">
      <div>
        <div class="text-vs-dim text-2xs uppercase tracking-wider mb-1">Timestamp</div>
        <div class="text-vs-text">{{ store.selectedEntry.value.timestamp || '-' }}</div>
      </div>

      <div>
        <div class="text-vs-dim text-2xs uppercase tracking-wider mb-1">Level</div>
        <div
          class="font-semibold"
          :class="levelColors[store.selectedEntry.value.level]"
        >
          {{ store.selectedEntry.value.level }}
        </div>
      </div>

      <div>
        <div class="text-vs-dim text-2xs uppercase tracking-wider mb-1">Message</div>
        <div class="text-vs-text break-words leading-5">{{ store.selectedEntry.value.message }}</div>
      </div>

      <div>
        <div class="text-vs-dim text-2xs uppercase tracking-wider mb-1">Raw JSON</div>
        <pre class="m-0 whitespace-pre-wrap break-all text-vs-muted leading-5 bg-vs-base p-2 border border-vs-border">{{ JSON.stringify(store.selectedEntry.value.raw, null, 2) }}</pre>
      </div>
    </div>

    <button
      class="block mx-3 px-3 py-2 text-xs text-vs-text bg-vs-input hover:brightness-125 active:brightness-90 cursor-pointer border-none select-none leading-5"
      @click="close"
    >
      关闭
    </button>
  </div>
</template>

<style scoped>
.text-2xs { font-size: 0.65rem; }
</style>
