"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { ChatData } from "../types/chat"

interface ChatContextType {
  chatData: ChatData | null
  setChatData: (data: ChatData | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatData, setChatData] = useState<ChatData | null>(null)

  return <ChatContext.Provider value={{ chatData, setChatData }}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
