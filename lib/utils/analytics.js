export function analyzeChat(parsedChat) {
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

function getDateRange(messages) {
  const dates = messages.map((m) => m.timestamp)
  const start = new Date(Math.min(...dates))
  const end = new Date(Math.max(...dates))

  return {
    start: start.toLocaleDateString(),
    end: end.toLocaleDateString(),
  }
}

function getActiveDays(messages) {
  const uniqueDays = new Set()
  messages.forEach((message) => {
    const day = message.timestamp.toDateString()
    uniqueDays.add(day)
  })
  return uniqueDays.size
}

function generateTimeline(messages) {
  const dailyCounts = {}

  messages.forEach((message) => {
    const date = message.timestamp.toDateString()
    dailyCounts[date] = (dailyCounts[date] || 0) + 1
  })

  return Object.entries(dailyCounts)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(),
      count,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

function analyzeResponseTimes(messages) {
  const responseTimes = []
  let instant = 0,
    fast = 0,
    slow = 0

  for (let i = 1; i < messages.length; i++) {
    const current = messages[i]
    const previous = messages[i - 1]

    if (current.sender !== previous.sender) {
      const timeDiff = (current.timestamp - previous.timestamp) / (1000 * 60) // minutes
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

function formatResponseTime(minutes) {
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`
  return `${Math.round(minutes / 1440)}d`
}

function generateActivityHeatmap(messages) {
  const heatmap = {}

  messages.forEach((message) => {
    const day = message.timestamp.getDay()
    const hour = message.timestamp.getHours()
    const key = `${day}-${hour}`
    heatmap[key] = (heatmap[key] || 0) + 1
  })

  return heatmap
}

function findPeakHour(messages) {
  const hourCounts = {}

  messages.forEach((message) => {
    const hour = message.timestamp.getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })

  return Number.parseInt(Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0][0])
}

function analyzeWordFrequency(messages) {
  const wordCounts = {}
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

function calculateEmojiDensity(messages) {
  const totalMessages = messages.filter((m) => !m.isMedia).length
  const messagesWithEmojis = messages.filter((m) => m.hasEmoji && !m.isMedia).length

  return totalMessages > 0 ? Math.round((messagesWithEmojis / totalMessages) * 100) : 0
}

function calculateInterestScores(messages, participants) {
  const scores = {}

  participants.forEach((participant) => {
    const participantMessages = messages.filter((m) => m.sender === participant)
    const otherMessages = messages.filter((m) => m.sender !== participant)

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

function calculateResponsiveness(messages, participant) {
  let quickResponses = 0
  let totalResponses = 0

  for (let i = 1; i < messages.length; i++) {
    const current = messages[i]
    const previous = messages[i - 1]

    if (current.sender === participant && previous.sender !== participant) {
      totalResponses++
      const timeDiff = (current.timestamp - previous.timestamp) / (1000 * 60)
      if (timeDiff < 30) quickResponses++ // Quick response within 30 minutes
    }
  }

  return totalResponses > 0 ? Math.round((quickResponses / totalResponses) * 100) : 0
}

function calculateInitiation(messages, participant) {
  let initiations = 0
  let totalConversations = 0

  for (let i = 1; i < messages.length; i++) {
    const current = messages[i]
    const previous = messages[i - 1]

    // Check for conversation gaps (more than 3 hours)
    const timeDiff = (current.timestamp - previous.timestamp) / (1000 * 60 * 60)
    if (timeDiff > 3) {
      totalConversations++
      if (current.sender === participant) {
        initiations++
      }
    }
  }

  return totalConversations > 0 ? Math.round((initiations / totalConversations) * 100) : 0
}

function calculateEffort(messages) {
  if (messages.length === 0) return 0

  const avgWordCount = messages.reduce((sum, m) => sum + m.wordCount, 0) / messages.length
  const emojiUsage = messages.filter((m) => m.hasEmoji).length / messages.length

  // Score based on message length and emoji usage
  const lengthScore = Math.min(avgWordCount * 10, 70) // Cap at 70
  const emojiScore = emojiUsage * 30 // Up to 30 points for emoji usage

  return Math.round(lengthScore + emojiScore)
}

function generateExplanation(responsiveness, initiation, effort, overall) {
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
