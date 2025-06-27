"use client"

import { useEffect, useRef } from "react"
import type { ChatData } from "../types/chat"

interface TimelineChartProps {
  chatData: ChatData
}

export default function TimelineChart({ chatData }: TimelineChartProps) {
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
          type: "line",
          data: {
            labels: chatData.timeline.map((d) => d.date),
            datasets: [
              {
                label: "Messages per Day",
                data: chatData.timeline.map((d) => d.count),
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Message Timeline",
                color: document.documentElement.classList.contains("dark") ? "#fff" : "#000",
              },
              legend: {
                labels: {
                  color: document.documentElement.classList.contains("dark") ? "#fff" : "#000",
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280",
                },
                grid: {
                  color: document.documentElement.classList.contains("dark") ? "#374151" : "#e5e7eb",
                },
              },
              y: {
                ticks: {
                  color: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280",
                },
                grid: {
                  color: document.documentElement.classList.contains("dark") ? "#374151" : "#e5e7eb",
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
