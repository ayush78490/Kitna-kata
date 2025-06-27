export interface Message {
  id: number
  timestamp: Date
  sender: string
  content: string
  isMedia: boolean
  hasEmoji: boolean
  isQuestion: boolean
  wordCount: number
}

export interface ParsedChat {
  messages: Message[]
  participants: string[]
}

export interface TimelineData {
  date: string
  count: number
}

export interface ResponseTimeDistribution {
  instant: number
  fast: number
  slow: number
}

export interface InterestScore {
  responsiveness: number
  initiation: number
  effort: number
  overall: number
  explanation: string
}

export interface WordFrequency {
  word: string
  count: number
}

export interface ChatData {
  totalMessages: number
  participants: string[]
  dateRange: {
    start: string
    end: string
  }
  activeDays: number
  timeline: TimelineData[]
  responseTimeDistribution: ResponseTimeDistribution
  avgResponseTime: string
  activityHeatmap: Record<string, number>
  peakHour: number
  wordFrequency: WordFrequency[]
  emojiDensity: number
  totalQuestions: number
  interestScores: Record<string, InterestScore>
}
