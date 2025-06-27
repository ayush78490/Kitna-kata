"use client"

import type { ChatData } from "../types/chat"

interface ActivityHeatmapProps {
  chatData: ChatData
}

export default function ActivityHeatmap({ chatData }: ActivityHeatmapProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getActivityLevel = (day: number, hour: number) => {
    const key = `${day}-${hour}`
    const activity = chatData.activityHeatmap[key] || 0
    const maxActivity = Math.max(...Object.values(chatData.activityHeatmap))
    return maxActivity > 0 ? (activity / maxActivity) * 100 : 0
  }

  const getHeatmapColor = (level: number) => {
    if (level === 0) return "bg-gray-100 dark:bg-gray-800"
    // All levels use transparent pink
    return "bg-pink-50p"
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border pink-glow shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Heatmap</h3>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-25 gap-1 min-w-max">
          {/* Header row with hours */}
          <div></div>
          {hours.map((hour) => (
            <div key={hour} className="text-xs text-gray-500 dark:text-gray-400 text-center p-1">
              {hour.toString().padStart(2, "0")}
            </div>
          ))}

          {/* Data rows */}
          {days.map((day, dayIndex) => (
            <div key={day}>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center p-1">{day}</div>
              {hours.map((hour) => (
                <div
                  key={`${dayIndex}-${hour}`}
                  className={`w-4 h-4 rounded-sm ${getHeatmapColor(getActivityLevel(dayIndex, hour))}`}
                  title={`${day} ${hour}:00 - ${Math.round(getActivityLevel(dayIndex, hour))}% activity`}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>Less active</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
          <div className="w-3 h-3 rounded-sm bg-pink-50p"></div>
          <div className="w-3 h-3 rounded-sm bg-pink-50p"></div>
          <div className="w-3 h-3 rounded-sm bg-pink-50p"></div>
          <div className="w-3 h-3 rounded-sm bg-pink-50p"></div>
        </div>
        <span>More active</span>
      </div>
    </div>
  )
}
