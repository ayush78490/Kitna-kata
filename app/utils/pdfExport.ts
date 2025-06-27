import type { ChatData } from "../types/chat"

export async function exportToPDF(chatData: ChatData): Promise<void> {
  // Create a simple HTML report for printing
  const reportWindow = window.open("", "_blank")

  if (!reportWindow) {
    throw new Error("Unable to open new window for PDF export")
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>WhatsApp Chat Analysis Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .participant { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .score { font-size: 24px; font-weight: bold; color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>WhatsApp Chat Analysis Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>${chatData.totalMessages} messages • ${chatData.participants.length} participants • ${chatData.dateRange.start} to ${chatData.dateRange.end}</p>
      </div>

      <h2>Key Metrics</h2>
      <div class="metric">
        <strong>Total Messages:</strong> ${chatData.totalMessages.toLocaleString()}
      </div>
      <div class="metric">
        <strong>Active Days:</strong> ${chatData.activeDays}
      </div>
      <div class="metric">
        <strong>Avg Response Time:</strong> ${chatData.avgResponseTime}
      </div>
      <div class="metric">
        <strong>Peak Hour:</strong> ${chatData.peakHour}:00
      </div>
      <div class="metric">
        <strong>Emoji Density:</strong> ${chatData.emojiDensity}%
      </div>
      <div class="metric">
        <strong>Questions Asked:</strong> ${chatData.totalQuestions}
      </div>

      <h2>Interest Level Analysis</h2>
      ${Object.entries(chatData.interestScores)
        .map(
          ([participant, scores]) => `
        <div class="participant">
          <h3>${participant}</h3>
          <div class="score">${scores.overall}/100</div>
          <p><strong>Responsiveness:</strong> ${scores.responsiveness}%</p>
          <p><strong>Initiation:</strong> ${scores.initiation}%</p>
          <p><strong>Effort:</strong> ${scores.effort}%</p>
          <p><em>${scores.explanation}</em></p>
        </div>
      `,
        )
        .join("")}

      <h2>Most Used Words</h2>
      <table>
        <tr><th>Word</th><th>Count</th></tr>
        ${chatData.wordFrequency
          .slice(0, 20)
          .map((word) => `<tr><td>${word.word}</td><td>${word.count}</td></tr>`)
          .join("")}
      </table>

      <h2>Response Time Distribution</h2>
      <p>Instant (&lt;5m): ${chatData.responseTimeDistribution.instant}</p>
      <p>Fast (&lt;1h): ${chatData.responseTimeDistribution.fast}</p>
      <p>Slow (&gt;3h): ${chatData.responseTimeDistribution.slow}</p>
    </body>
    </html>
  `

  reportWindow.document.write(htmlContent)
  reportWindow.document.close()

  // Trigger print dialog
  setTimeout(() => {
    reportWindow.print()
  }, 500)
}
