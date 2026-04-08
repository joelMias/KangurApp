<template>
  <div ref="container" class="chart-container">
    <Bar :data="chartData" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import type { Chart } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const dashedGridPlugin = {
  id: 'dashedGrid',
  beforeDraw(chart: Chart) {
    const { ctx, chartArea, scales } = chart
    const yScale = (scales as any).y
    if (!yScale || !chartArea) return

    ctx.save()
    ctx.strokeStyle = '#999'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    yScale.ticks.forEach((_: unknown, i: number) => {
      const y = yScale.getPixelForTick(i)
      ctx.beginPath()
      ctx.moveTo(chartArea.left, y)
      ctx.lineTo(chartArea.right, y)
      ctx.stroke()
    })
    ctx.restore()
  }
}

ChartJS.register(dashedGridPlugin)

const props = defineProps<{
  labels: string[]
  datasets: { label: string; data: number[]; backgroundColor: string }[]
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets
}))

const container = ref<HTMLElement | null>(null)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const },
    datalabels: { display: false } as any,
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = Math.round(context.raw as number)
          return `${context.dataset.label}: ${value} min`
        }
      }
    }
  },
  scales: {
    x: {
      stacked: false,
      grid: { display: false },
      border: { display: false }
    },
    y: {
      stacked: false,
      grid: { display: false },
      border: { display: false },
      title: {
        display: true,
        text: 'minuts'
      }
    }
  },
  elements: {
    bar: { borderRadius: 8 }
  }
}

const options = ref(baseOptions)

function updateOptionsForWidth(w: number) {
  options.value = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: { position: w < 480 ? 'bottom' : 'bottom' }
    }
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
    updateOptionsForWidth(windowWidth.value)
    window.addEventListener('resize', handleWindowResize)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleWindowResize)
  }
})

const handleWindowResize = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
    updateOptionsForWidth(windowWidth.value)
  }
}

watch(windowWidth, (newWidth) => {
  updateOptionsForWidth(newWidth)
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: min(48vh, 420px);
}
</style>
