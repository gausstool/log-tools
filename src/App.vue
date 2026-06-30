<script setup lang="ts">
import { ref } from 'vue'
import { useLogStore } from './store'
import { parse } from './parser'
import Toolbar from './components/Toolbar.vue'
import LogTable from './components/LogTable.vue'
import DetailPanel from './components/DetailPanel.vue'


const store = useLogStore()
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
let dragCounter = 0

function handleFile(file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    const entries = parse(reader.result as string)
    store.setEntries(entries)
  }
  reader.readAsText(file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
  ;(e.target as HTMLInputElement).value = ''
}

function onDragEnter(e: DragEvent) {
  e.preventDefault()
  dragCounter++
  isDragging.value = true
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  dragCounter--
  if (dragCounter <= 0) {
    dragCounter = 0
    isDragging.value = false
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragCounter = 0
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}
</script>

<template>
  <div class="h-screen flex flex-col bg-vs-base">
    <input
      ref="fileInput"
      type="file"
      accept=".jsonl,.log,.txt"
      class="hidden"
      @change="onFileChange"
    />
    <Toolbar @open-file="fileInput?.click()" />

    <div
      class="flex-1 flex relative overflow-hidden"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <LogTable />

      <DetailPanel />

      <div
        v-if="isDragging"
        class="absolute inset-0 z-10 flex items-center justify-center bg-vs-base/85 border-2 border-dashed border-vs-blue/60"
      >
        <div class="text-center select-none">
          <div class="text-lg text-vs-blue mb-1">放置日志文件</div>
          <div class="text-xs text-vs-muted">JSONL 或 Nginx 访问日志</div>
        </div>
      </div>
    </div>

  </div>
</template>
