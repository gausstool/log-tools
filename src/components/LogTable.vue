<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { useLogStore } from '../store'
import LogRow from './LogRow.vue'

const store = useLogStore()
const scrollRef = useTemplateRef<HTMLDivElement>('scrollRef')

const count = computed(() => store.filteredEntries.value.length)
const search = computed(() => store.filter.value.search)

const virtualizer = useVirtualizer(
  computed(() => ({
    count: count.value,
    getScrollElement: () => scrollRef.value,
    estimateSize: () => 24,
    overscan: 20,
  })),
)

function scrollToTop() {
  virtualizer.value.scrollToIndex(0)
}

watch(count, () => scrollToTop())
</script>

<template>
  <div
    ref="scrollRef"
    class="flex-1 overflow-auto"
  >
    <div
      v-if="store.entries.value.length === 0"
      class="flex items-center justify-center min-h-full text-vs-dim select-none"
    >
      <div class="text-center">
        <div class="text-sm mb-1">无日志数据</div>
        <div class="text-xs">点击上方「打开日志」或将日志文件拖拽到此处</div>
      </div>
    </div>

    <div
      v-else-if="count === 0"
      class="flex items-center justify-center min-h-full text-vs-dim select-none"
    >
      <div class="text-sm">没有匹配的日志条目</div>
    </div>

    <div
      v-else
      :style="{ height: virtualizer.getTotalSize() + 'px' }"
      class="relative w-full"
    >
      <div
        v-for="row in virtualizer.getVirtualItems()"
        :key="row.key"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: row.size + 'px',
          transform: `translateY(${row.start}px)`,
        }"
      >
        <LogRow
          :entry="store.filteredEntries.value[row.index]"
          :search="search"
          :selected="store.selectedEntry.value === store.filteredEntries.value[row.index]"
          @select="store.selectEntry(store.filteredEntries.value[row.index])"
        />
      </div>
    </div>
  </div>
</template>
