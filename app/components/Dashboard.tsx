"use client"

import { useState } from "react"
import { useChatContext } from "../contexts/ChatContext"
import type { ChatData } from "../types/chat"
import MetricsOverview from "./MetricsOverview"
import TimelineChart from "./TimelineChart"
import ResponseTimeChart from "./ResponseTimeChart"
import ActivityHeatmap from "./ActivityHeatmap"
import InterestRadar from "./InterestRadar"
import WordCloud from "./WordCloud"
import InterestScores from "./InterestScores"
import { exportToPDF } from "../utils/pdfExport"

interface DashboardProps {
  chatData: ChatData
}

export default function Dashboard({ chatData }: DashboardProps) {
  const { setChatData } = useChatContext()
  const [showExportModal, setShowExportModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleNewAnalysis = () => {
    setChatData(null)
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      await exportToPDF(chatData)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
      setShowExportModal(false)
    }
  }

  const shareResults = () => {
    const shareData = {
      participants: chatData.participants.length,
      totalMessages: chatData.totalMessages,
      dateRange: `${chatData.dateRange.start} to ${chatData.dateRange.end}`,
      topInterest: Math.max(...Object.values(chatData.interestScores).map((s) => s.overall)),
    }

    const url = new URL(window.location.href)
    url.searchParams.set("shared", btoa(JSON.stringify(shareData)))

    navigator.clipboard.writeText(url.toString()).then(() => {
      alert("Shareable link copied to clipboard!")
    })
  }

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-pink-900 dark:text-white">Chat Analysis Results</h2>
          <p className="text-pink-600 dark:text-pink-300">
            {chatData.totalMessages} messages • {chatData.participants.length} participants •{chatData.dateRange.start}{" "}
            to {chatData.dateRange.end}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={shareResults}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            Share
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export PDF
          </button>

          <button
            onClick={handleNewAnalysis}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            New Analysis
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsOverview chatData={chatData} />

      {/* Interest Scores */}
      <InterestScores chatData={chatData} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TimelineChart chatData={chatData} />
        <ResponseTimeChart chatData={chatData} />
        <ActivityHeatmap chatData={chatData} />
        <InterestRadar chatData={chatData} />
      </div>

      {/* Word Cloud */}
      <WordCloud chatData={chatData} />

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-pink dark:bg-pink-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-pink-900 dark:text-white mb-4">Export PDF Report</h3>
            <p className="text-pink-600 dark:text-pink-300 mb-6">
              Generate a comprehensive PDF report with all your chat analysis results.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-pink-600 dark:text-pink-300 hover:text-pink-800 dark:hover:text-white transition-colors"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isExporting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {isExporting ? "Generating..." : "Export PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
