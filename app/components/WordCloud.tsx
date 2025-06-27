"use client"

import { useEffect, useRef } from "react"
import type { ChatData } from "../types/chat"

interface WordCloudProps {
  chatData: ChatData
}

export default function WordCloud({ chatData }: WordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")!

      canvas.width = canvas.offsetWidth
      canvas.height = 300

      // Simple word cloud implementation
      const words = chatData.wordFrequency.slice(0, 50)
      const maxCount = Math.max(...words.map((w) => w.count))

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      words.forEach((word, index) => {
        const fontSize = Math.max(12, (word.count / maxCount) * 48)
        const x = Math.random() * (canvas.width - word.word.length * fontSize * 0.6)
        const y = Math.random() * (canvas.height - fontSize) + fontSize

        ctx.font = `${fontSize}px Arial`
        ctx.fillStyle = `hsl(${(index * 137.5) % 360}, 70%, 50%)`
        ctx.fillText(word.word, x, y)
      })
    }
  }, [chatData])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border pink-glow shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Used Words</h3>

      <canvas
        ref={canvasRef}
        className="w-full h-75 border border-gray-200 dark:border-gray-600 rounded"
        style={{ height: "300px" }}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {chatData.wordFrequency.slice(0, 20).map((word) => (
          <span
            key={word.word}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
          >
            {word.word} ({word.count})
          </span>
        ))}
      </div>
    </div>
  )
}
