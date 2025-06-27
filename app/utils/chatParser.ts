import type { Message, ParsedChat, ChatData } from "../types/chat"

export function parseWhatsAppChat(text: string): ParsedChat {
  const lines = text.split("\n")
  const messages: Message[] = []
  const participants = new Set<string>()

  // Enhanced regex patterns for different WhatsApp export formats
  const patterns = [
    // Format: [DD/MM/YYYY, HH:MM:SS] Name: Message
    /^\[(\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.*)$/,
    // Format: DD/MM/YYYY, HH:MM - Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{1,2}:\d{2})\s-\s([^:]+):\s(.*)$/,
    // Format: MM/DD/YY, HH:MM - Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2})\s-\s([^:]+):\s(.*)$/,
    // Format: DD/MM/YYYY, HH:MM:SS - Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{1,2}:\d{2}:\d{2})\s-\s([^:]+):\s(.*)$/,
    // Format: M/D/YY, H:MM AM/PM - Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}\s(?:AM|PM))\s-\s([^:]+):\s(.*)$/i,
    // Format: DD.MM.YY, HH:MM - Name: Message (European)
    /^(\d{1,2}\.\d{1,2}\.\d{2}),\s(\d{1,2}:\d{2})\s-\s([^:]+):\s(.*)$/,
    // Format: YYYY-MM-DD HH:MM:SS - Name: Message
    /^(\d{4}-\d{1,2}-\d{1,2})\s(\d{1,2}:\d{2}:\d{2})\s-\s([^:]+):\s(.*)$/,
    // Format: [DD.MM.YY, HH:MM:SS] Name: Message
    /^\[(\d{1,2}\.\d{1,2}\.\d{2}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.*)$/,
  ]

  let currentMessage: Message | null = null
  let matchedLines = 0
  let totalNonEmptyLines = 0

  // Debug: Log first few lines to understand format
  console.log("First 5 lines of chat file:")
  lines.slice(0, 5).forEach((line, index) => {
    if (line.trim()) {
      console.log(`Line ${index + 1}: "${line}"`)
      totalNonEmptyLines++
    }
  })

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    if (!line.trim()) continue

    let matched = false

    for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
      const pattern = patterns[patternIndex]
      const match = line.match(pattern)

      if (match) {
        // Save previous message if exists
        if (currentMessage) {
          messages.push(currentMessage)
        }

        const [, date, time, sender, content] = match
        const cleanSender = sender.trim()
        participants.add(cleanSender)

        currentMessage = {
          id: messages.length,
          timestamp: parseTimestamp(date, time),
          sender: cleanSender,
          content: content.trim(),
          isMedia: isMediaMessage(content),
          hasEmoji: hasEmojis(content),
          isQuestion: isQuestion(content),
          wordCount: countWords(content),
        }

        matched = true
        matchedLines++

        // Debug: Log first successful match
        if (matchedLines === 1) {
          console.log(`First match found with pattern ${patternIndex + 1}:`, {
            date,
            time,
            sender: cleanSender,
            content: content.substring(0, 50) + "...",
          })
        }
        break
      }
    }

    // If no pattern matched and we have a current message, it's a continuation
    if (!matched && currentMessage && line.trim()) {
      currentMessage.content += "\n" + line.trim()
      currentMessage.wordCount = countWords(currentMessage.content)
      currentMessage.hasEmoji = hasEmojis(currentMessage.content)
      currentMessage.isQuestion = isQuestion(currentMessage.content)
    }
  }

  // Add the last message
  if (currentMessage) {
    messages.push(currentMessage)
  }

  console.log(`Parsing results: ${matchedLines} matched lines out of ${totalNonEmptyLines} non-empty lines`)
  console.log(`Found ${messages.length} messages from ${participants.size} participants`)

  if (messages.length === 0) {
    console.error("No messages parsed. This might be due to:")
    console.error("1. Unsupported date/time format")
    console.error("2. Different language export")
    console.error("3. Corrupted or modified file")
    console.error("Sample lines that didn't match:")
    lines.slice(0, 3).forEach((line, index) => {
      if (line.trim()) console.error(`  Line ${index + 1}: "${line}"`)
    })
  }

  return {
    messages,
    participants: Array.from(participants),
  }
}

function parseTimestamp(date: string, time: string): Date {
  let day: string, month: string, year: string

  // Handle different date separators and formats
  let dateParts: string[]

  if (date.includes("/")) {
    dateParts = date.split("/")
  } else if (date.includes(".")) {
    dateParts = date.split(".")
  } else if (date.includes("-")) {
    // YYYY-MM-DD format
    dateParts = date.split("-")
    year = dateParts[0]
    month = dateParts[1]
    day = dateParts[2]
  } else {
    throw new Error(`Unsupported date format: ${date}`)
  }

  if (date.includes("/") || date.includes(".")) {
    if (dateParts[2].length === 4) {
      // DD/MM/YYYY or MM/DD/YYYY or DD.MM.YYYY
      if (Number.parseInt(dateParts[0]) > 12) {
        // DD/MM/YYYY or DD.MM.YYYY
        ;[day, month, year] = dateParts
      } else if (Number.parseInt(dateParts[1]) > 12) {
        // MM/DD/YYYY
        ;[month, day, year] = dateParts
      } else {
        // Ambiguous, assume DD/MM/YYYY (most common internationally)
        ;[day, month, year] = dateParts
      }
    } else {
      // DD/MM/YY, MM/DD/YY, or DD.MM.YY format
      if (Number.parseInt(dateParts[0]) > 12) {
        // DD/MM/YY or DD.MM.YY
        ;[day, month, year] = dateParts
      } else {
        // MM/DD/YY (US format)
        ;[month, day, year] = dateParts
      }
      year = "20" + year
    }
  }

  // Handle time with AM/PM
  let hours: string,
    minutes: string,
    seconds = "00"

  if (time.toUpperCase().includes("AM") || time.toUpperCase().includes("PM")) {
    const isPM = time.toUpperCase().includes("PM")
    const timeOnly = time.replace(/\s*(AM|PM)/i, "")
    const timeParts = timeOnly.split(":")
    hours = timeParts[0]
    minutes = timeParts[1]

    let hourNum = Number.parseInt(hours)
    if (isPM && hourNum !== 12) {
      hourNum += 12
    } else if (!isPM && hourNum === 12) {
      hourNum = 0
    }
    hours = hourNum.toString()
  } else {
    const timeParts = time.split(":")
    hours = timeParts[0]
    minutes = timeParts[1]
    seconds = timeParts[2] || "00"
  }

  return new Date(
    Number.parseInt(year),
    Number.parseInt(month) - 1,
    Number.parseInt(day),
    Number.parseInt(hours),
    Number.parseInt(minutes),
    Number.parseInt(seconds),
  )
}

function isMediaMessage(content: string): boolean {
  const mediaIndicators = [
    "<Media omitted>",
    "image omitted",
    "video omitted",
    "audio omitted",
    "document omitted",
    "sticker omitted",
  ]

  return mediaIndicators.some((indicator) => content.toLowerCase().includes(indicator.toLowerCase()))
}

function hasEmojis(text: string): boolean {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  return emojiRegex.test(text)
}

function isQuestion(text: string): boolean {
  return (
    text.includes("?") ||
    /\b(what|how|when|where|why|who|which|can|could|would|will|do|does|did|is|are|was|were)\b/i.test(text)
  )
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
}

export function analyzeChat(parsedChat: ParsedChat): ChatData {
  const { messages, participants } = parsedChat

  if (messages.length === 0) {
    throw new Error("No messages to analyze")
  }

  // Basic metrics
  const totalMessages = messages.length
  const dateRange = getDateRange(messages)
  const activeDays = getActiveDays(messages)

  // Timeline analysis
  const timeline = generateTimeline(messages)

  // Response time analysis
  const responseTimeData = analyzeResponseTimes(messages)

  // Activity patterns
  const activityHeatmap = generateActivityHeatmap(messages)
  const peakHour = findPeakHour(messages)

  // Content analysis
  const wordFrequency = analyzeWordFrequency(messages)
  const emojiDensity = calculateEmojiDensity(messages)
  const totalQuestions = messages.filter((m) => m.isQuestion).length

  // Interest scoring
  const interestScores = calculateInterestScores(messages, participants)

  return {
    totalMessages,
    participants,
    dateRange,
    activeDays,
    timeline,
    responseTimeDistribution: responseTimeData.distribution,
    avgResponseTime: responseTimeData.average,
    activityHeatmap,
    peakHour,
    wordFrequency,
    emojiDensity,
    totalQuestions,
    interestScores,
  }
}

function getDateRange(messages: Message[]) {
  const dates = messages.map((m) => m.timestamp)
  const start = new Date(Math.min(...dates.map((d) => d.getTime())))
  const end = new Date(Math.max(...dates.map((d) => d.getTime())))

  return {
    start: start.toLocaleDateString(),
    end: end.toLocaleDateString(),
  }
}

function getActiveDays(messages: Message[]): number {
  const uniqueDays = new Set<string>()
  messages.forEach((message) => {
    const day = message.timestamp.toDateString()
    uniqueDays.add(day)
  })
  return uniqueDays.size
}

function generateTimeline(messages: Message[]) {
  const dailyCounts: Record<string, number> = {}

  messages.forEach((message) => {
    const date = message.timestamp.toDateString()
    dailyCounts[date] = (dailyCounts[date] || 0) + 1
  })

  return Object.entries(dailyCounts)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(),
      count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function analyzeResponseTimes(messages: Message[]) {
  const responseTimes: number[] = []
  let instant = 0,
    fast = 0,
    slow = 0

  for (let i = 1; i < messages.length; i++) {
    const current = messages[i]
    const previous = messages[i - 1]

    if (current.sender !== previous.sender) {
      const timeDiff = (current.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60) // minutes
      responseTimes.push(timeDiff)

      if (timeDiff < 5) instant++
      else if (timeDiff < 60) fast++
      else slow++
    }
  }

  const avgResponseTime =
    responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0

  return {
    distribution: { instant, fast, slow },
    average: formatResponseTime(avgResponseTime),
  }
}

function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`
  return `${Math.round(minutes / 1440)}d`
}

function generateActivityHeatmap(messages: Message[]): Record<string, number> {
  const heatmap: Record<string, number> = {}

  messages.forEach((message) => {
    const day = message.timestamp.getDay()
    const hour = message.timestamp.getHours()
    const key = `${day}-${hour}`
    heatmap[key] = (heatmap[key] || 0) + 1
  })

  return heatmap
}

function findPeakHour(messages: Message[]): number {
  const hourCounts: Record<number, number> = {}

  messages.forEach((message) => {
    const hour = message.timestamp.getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })

  return Number.parseInt(Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0][0])
}

function analyzeWordFrequency(messages: Message[]) {
  const wordCounts: Record<string, number> = {}
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
  ])

  messages.forEach((message) => {
    if (!message.isMedia) {
      const words = message.content
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word))

      words.forEach((word) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1
      })
    }
  })

  return Object.entries(wordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 100)
}

function calculateEmojiDensity(messages: Message[]): number {
  const totalMessages = messages.filter((m) => !m.isMedia).length
  const messagesWithEmojis = messages.filter((m) => m.hasEmoji && !m.isMedia).length

  return totalMessages > 0 ? Math.round((messagesWithEmojis / totalMessages) * 100) : 0
}

function calculateInterestScores(messages: Message[], participants: string[]) {
  const scores: Record<string, any> = {}

  participants.forEach((participant) => {
    const participantMessages = messages.filter((m) => m.sender === participant)

    // Responsiveness: How quickly they respond
    const responsiveness = calculateResponsiveness(messages, participant)

    // Initiation: How often they start conversations
    const initiation = calculateInitiation(messages, participant)

    // Effort: Message length and emoji usage
    const effort = calculateEffort(participantMessages)

    // Overall score
    const overall = Math.round((responsiveness + initiation + effort) / 3)

    scores[participant] = {
      responsiveness,
      initiation,
      effort,
      overall,
      explanation: generateExplanation(responsiveness, initiation, effort, overall),
    }
  })

  return scores
}

function calculateResponsiveness(messages: Message[], participant: string): number {
  let quickResponses = 0
  let totalResponses = 0

  for (let i = 1; i < messages.length; i++) {
    const current = messages[i]
    const previous = messages[i - 1]

    if (current.sender === participant && previous.sender !== participant) {
      totalResponses++
      const timeDiff = (current.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60)
      if (timeDiff < 30) quickResponses++ // Quick response within 30 minutes
    }
  }

  return totalResponses > 0 ? Math.round((quickResponses / totalResponses) * 100) : 0
}

function calculateInitiation(messages: Message[], participant: string): number {
  let initiations = 0
  let totalConversations = 0

  for (let i = 1; i < messages.length; i++) {
    const current = messages[i]
    const previous = messages[i - 1]

    // Check for conversation gaps (more than 3 hours)
    const timeDiff = (current.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60 * 60)
    if (timeDiff > 3) {
      totalConversations++
      if (current.sender === participant) {
        initiations++
      }
    }
  }

  return totalConversations > 0 ? Math.round((initiations / totalConversations) * 100) : 0
}

function calculateEffort(messages: Message[]): number {
  if (messages.length === 0) return 0

  const avgWordCount = messages.reduce((sum, m) => sum + m.wordCount, 0) / messages.length
  const emojiUsage = messages.filter((m) => m.hasEmoji).length / messages.length

  // Score based on message length and emoji usage
  const lengthScore = Math.min(avgWordCount * 10, 70) // Cap at 70
  const emojiScore = emojiUsage * 30 // Up to 30 points for emoji usage

  return Math.round(lengthScore + emojiScore)
}

function generateExplanation(responsiveness: number, initiation: number, effort: number, overall: number): string {
  if (overall >= 80) {
    return "High interest: Fast responses, frequent conversation starters, and engaging messages!"
  } else if (overall >= 60) {
    return "Good interest: Shows engagement with decent response times and effort."
  } else if (overall >= 40) {
    return "Moderate interest: Some engagement but could be more responsive or initiating."
  } else {
    return "Low interest: Infrequent responses and minimal conversation initiation."
  }
}
