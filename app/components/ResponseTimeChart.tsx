"use client"

import { useEffect, useRef } from "react"
import type { ChatData } from "../types/chat"

interface ResponseTimeChartProps {
  chatData: ChatData
}

export default function ResponseTimeChart({ chatData }: ResponseTimeChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)

  useEffect(() => {
    const loadChart = async () => {
      const { Chart, registerables } = await import("chart.js")
      Chart.register(...registerables)

      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d")

        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        chartInstance.current = new Chart(ctx!, {
          type: "doughnut",
          data: {
            labels: ["Instant (<5m)", "Fast (<1h)", "Slow (>3h)"],
            datasets: [
              {
                data: [
                  chatData.responseTimeDistribution.instant,
                  chatData.responseTimeDistribution.fast,
                  chatData.responseTimeDistribution.slow,
                ],
                backgroundColor: ["rgb(34, 197, 94)", "rgb(251, 191, 36)", "rgb(239, 68, 68)"],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Response Time Distribution",
                color: document.documentElement.classList.contains("dark") ? "#fff" : "#000",
              },
              legend: {
                position: "bottom",
                labels: {
                  color: document.documentElement.classList.contains("dark") ? "#fff" : "#000",
                  padding: 20,
                },
              },
            },
          },
        })
      }
    }

    loadChart()

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [chatData])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border pink-glow shadow-sm">
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  )
}
