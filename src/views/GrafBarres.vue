<template>
  <Bar :data="chartData" :options="barchartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import type { ChartOptions, Chart } from 'chart.js'

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

const barchartOptions: ChartOptions<'bar'> = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' as const },
    datalabels: { display: false } as any,
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false
      },
      border: {
        display: false
      }
    },
    y: {
      stacked: true,
      grid: {
        display: false
      },
      border: {
        display: false
      }
    }
  },
  elements: {
    bar: {
      borderRadius: 8
    }
  }
}
</script>
