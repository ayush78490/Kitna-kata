import { Inter } from "next/font/google"
import "./globals.css"
import { ChatProvider } from "./contexts/ChatContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "WhatsApp Chat Analyzer",
  description: "Analyze your WhatsApp chats to measure engagement and predict interest levels",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Floating hearts background */}
        <div className="floating-hearts">
          {[...Array(12)].map((_, i) => (
            <svg
              key={i}
              className="floating-heart"
              style={{
                left: `${Math.random() * 100}vw`,
                animationDelay: `${Math.random() * 8}s`,
                top: 0,
              }}
              viewBox="0 0 32 32"
              fill="#ff69b4"
            >
              <path d="M23.6,4.6c-2.6,0-4.9,1.6-5.6,4C17,6.2,14.7,4.6,12.1,4.6C8.1,4.6,5,7.7,5,11.7c0,7.1,11,15.7,11,15.7
                s11-8.6,11-15.7C27,7.7,23.9,4.6,23.6,4.6z"/>
            </svg>
          ))}
        </div>
        <ThemeProvider>
          <ChatProvider>{children}</ChatProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}