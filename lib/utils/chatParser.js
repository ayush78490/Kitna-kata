export function parseWhatsAppChat(text) {
  const lines = text.split("\n")
  const messages = []
  const participants = new Set()

  // Regex patterns for different WhatsApp export formats
  const patterns = [
    // Format: [DD/MM/YYYY, HH:MM:SS] Name: Message
    /^\[(\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.*)$/,
    // Format: DD/MM/YYYY, HH:MM - Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{1,2}:\d{2})\s-\s([^:]+):\s(.*)$/,
    // Format: MM/DD/YY, HH:MM - Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2})\s-\s([^:]+):\s(.*)$/,
  ]

  let currentMessage = null

  for (const line of lines) {
    let matched = false

    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        // Save previous message if exists
        if (currentMessage) {
          messages.push(currentMessage)
        }

        const [, date, time, sender, content] = match
        participants.add(sender.trim())

        currentMessage = {
          id: messages.length,
          timestamp: parseTimestamp(date, time),
          sender: sender.trim(),
          content: content.trim(),
          isMedia: isMediaMessage(content),
          hasEmoji: hasEmojis(content),
          isQuestion: isQuestion(content),
          wordCount: countWords(content),
        }

        matched = true
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

  return {
    messages,
    participants: Array.from(participants),
  }
}

function parseTimestamp(date, time) {
  // Handle different date formats
  const dateParts = date.split("/")
  let day, month, year

  if (dateParts[2].length === 4) {
    // DD/MM/YYYY or MM/DD/YYYY
    if (Number.parseInt(dateParts[0]) > 12) {
      // DD/MM/YYYY
      ;[day, month, year] = dateParts
    } else {
      // MM/DD/YYYY
      ;[month, day, year] = dateParts
    }
  } else {
    // MM/DD/YY
    ;[month, day, year] = dateParts
    year = "20" + year
  }

  const [hours, minutes, seconds = "00"] = time.split(":")

  return new Date(
    Number.parseInt(year),
    Number.parseInt(month) - 1,
    Number.parseInt(day),
    Number.parseInt(hours),
    Number.parseInt(minutes),
    Number.parseInt(seconds),
  )
}

function isMediaMessage(content) {
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

function hasEmojis(text) {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  return emojiRegex.test(text)
}

function isQuestion(text) {
  return (
    text.includes("?") ||
    /\b(what|how|when|where|why|who|which|can|could|would|will|do|does|did|is|are|was|were)\b/i.test(text)
  )
}

function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
}
