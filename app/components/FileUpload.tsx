"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useChatStore } from "../../lib/stores"
import { parseWhatsAppChat, analyzeChat } from "../utils/chatParser"

interface FileUploadProps {
  onProcessingStart: () => void
  onProcessingComplete: () => void
  isProcessing: boolean
}

export default function FileUpload({ onProcessingStart, onProcessingComplete, isProcessing }: FileUploadProps) {
  const setChatData = useChatStore((state) => state.setChatData)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".txt")) {
      setError("Please upload a .txt file exported from WhatsApp")
      return
    }

    setError(null)
    onProcessingStart()

    try {
      const text = await file.text()
      const parsedChat = parseWhatsAppChat(text)

      if (parsedChat.messages.length === 0) {
        throw new Error("No valid WhatsApp messages found in the file")
      }

      const analyzedData = analyzeChat(parsedChat)
      setChatData(analyzedData)

      onProcessingComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      onProcessingComplete()
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Analyze Your WhatsApp Chat</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Upload your exported WhatsApp chat to discover engagement patterns, predict interest levels, and visualize
          communication insights.
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          dragActive ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"
        } ${
          isProcessing
            ? "opacity-50 pointer-events-none"
            : "hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") triggerFileInput()
        }}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">Processing your chat...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This may take a few moments</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Drop your WhatsApp chat file here</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to browse files</p>
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              onClick={triggerFileInput}
            >
              Choose File
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white dark:bg-pink-80p rounded-lg p-6 border pink-glow shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How to export your WhatsApp chat:</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>Open WhatsApp and go to the chat you want to analyze</li>
          <li>Tap the contact/group name at the top</li>
          <li>Scroll down and tap "Export Chat"</li>
          <li>Choose "Without Media" for faster processing</li>
          <li>Save the .txt file and upload it here</li>
        </ol>
      </div>

      <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={handleFileSelect} />
    </div>
  )
}
