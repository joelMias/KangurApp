<template>
  <div ref="container" class="chart-container">
    <Doughnut :data="chartData" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue"
import { Doughnut } from "vue-chartjs"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"
import type { ChartOptions } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart: any) {
    if (chart.config.type !== "doughnut") return

    const { ctx, chartArea } = chart
    const dataset = chart.data.datasets[0]
    const total = dataset.data.reduce((a: number, b: number) => a + b, 0)

    ctx.save()
    ctx.font = "bold 18px sans-serif"
    ctx.fillStyle = "#333"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(total.toFixed(0), (chartArea.left + chartArea.right) / 2, (chartArea.top + chartArea.bottom) / 2)
  }
}

const props = defineProps<{ data: Record<string, number> }>()

const chartData = computed(() => ({
  labels: Object.keys(props.data),
  datasets: [
    {
      data: Object.values(props.data),
      backgroundColor: ["#FFEEBC", "#ADD8E6", "#90EE90", "#3f37c9", "#3a0ca3"]
    }
  ]
}))

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "60%",
  plugins: {
    legend: { position: 'right' as const },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context: any) => {
          const value = Math.round(context.raw as number)
          return `${context.label}: ${value} min`
        }
      }
    },
    datalabels: {
      color: "#000",
      font: { weight: "bold", size: 14 },
      formatter: (value: number) => value.toFixed(0)
    }
  }
} as ChartOptions<'doughnut'>

const options = ref(baseOptions)

function adaptLegendForWidth() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1024
  options.value = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: { position: w < 520 ? 'bottom' as const : 'right' as const }
    }
  }
}

onMounted(() => {
  adaptLegendForWidth()
  window.addEventListener('resize', adaptLegendForWidth)
  window.addEventListener('orientationchange', adaptLegendForWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', adaptLegendForWidth)
  window.removeEventListener('orientationchange', adaptLegendForWidth)
})

ChartJS.register(centerTextPlugin)
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: min(48vh, 420px);
}
</style>
