"use client"

import type { ChatData } from "../types/chat"

interface InterestScoresProps {
  chatData: ChatData
}

export default function InterestScores({ chatData }: InterestScoresProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    if (score >= 40) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20"
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20"
    if (score >= 40) return "bg-orange-100 dark:bg-orange-900/20"
    return "bg-red-100 dark:bg-red-900/20"
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    if (score >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border pink-glow shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Interest Level Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(chatData.interestScores).map(([participant, scores]) => (
          <div key={participant} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white">{participant}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(scores.overall)}`}>{scores.overall}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Overall Score */}
              <div className={`p-3 rounded-lg ${getScoreBackground(scores.overall)}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Interest</span>
                  <span className={`text-sm ${getScoreColor(scores.overall)}`}>{scores.overall}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(scores.overall)}`}
                    style={{ width: `${scores.overall}%` }}
                  ></div>
                </div>
              </div>

              {/* Individual Metrics */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Responsiveness</span>
                  <span className={`text-sm font-medium ${getScoreColor(scores.responsiveness)}`}>
                    {scores.responsiveness}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${getProgressColor(scores.responsiveness)}`}
                    style={{ width: `${scores.responsiveness}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Initiation</span>
                  <span className={`text-sm font-medium ${getScoreColor(scores.initiation)}`}>
                    {scores.initiation}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${getProgressColor(scores.initiation)}`}
                    style={{ width: `${scores.initiation}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Effort</span>
                  <span className={`text-sm font-medium ${getScoreColor(scores.effort)}`}>{scores.effort}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${getProgressColor(scores.effort)}`}
                    style={{ width: `${scores.effort}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
              {scores.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
