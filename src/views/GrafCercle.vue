<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from "vue"
import { Doughnut } from "vue-chartjs"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"
import type { ChartOptions } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart: any) {
    if (chart.config.type !== "doughnut") return; // només en Doughnut

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

const chartOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  cutout: "60%",
  plugins: {
    legend: {
      position: "right" as const
    },
    tooltip: {
      enabled: true
      ,callbacks: {
        label: (context: any) => {
          const value = Math.round(context.raw as number)
          return `${context.label}: ${value} min`
        }
      }
    },
    datalabels: {
      color: "#000",
      font: {
        weight: "bold",
        size: 14
      },
      formatter: (value: number) => value.toFixed(0)
    }
  }
}

ChartJS.register(centerTextPlugin)
</script>
