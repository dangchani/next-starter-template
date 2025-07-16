'use client'

import { useState, useEffect } from 'react'

interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'info' | 'warning'
}

interface RealtimeToastProps {
  messages: ToastMessage[]
  onRemove: (id: string) => void
}

export default function RealtimeToast({ messages, onRemove }: RealtimeToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white max-w-sm transform transition-all duration-300 ${
            message.type === 'success' ? 'bg-green-500' :
            message.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm">{message.message}</span>
            <button
              onClick={() => onRemove(message.id)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// 토스트 메시지 관리를 위한 훅
export function useRealtimeToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const addMessage = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString()
    const newMessage = { id, message, type }
    setMessages(prev => [...prev, newMessage])

    // 3초 후 자동 제거
    setTimeout(() => {
      removeMessage(id)
    }, 3000)
  }

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  return { messages, addMessage, removeMessage }
} 