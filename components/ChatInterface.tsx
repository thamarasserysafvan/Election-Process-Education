"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! I am your official Election Educational Assistant. To get started, **which state in India are you from?** Knowing your state helps me provide accurate upcoming election dates, registration deadlines, and candidate information.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
        }),
      });

      const data: { reply?: string; error?: string } = await response.json();

      if (response.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'assistant', content: data.reply! },
        ]);
      } else {
        const errText = data.error ?? 'An unexpected error occurred. Please try again.';
        setError(errText);
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'assistant', content: errText },
        ]);
      }
    } catch {
      const msg = 'Failed to connect to the server. Please check your connection and try again.';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: msg },
      ]);
    } finally {
      setIsLoading(false);
      // Return focus to input after response
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section
      aria-label="Election Assistant Chat"
      className="flex flex-col h-[600px] w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 overflow-hidden"
    >
      {/* Header */}
      <div
        className="bg-blue-600 p-4 text-white font-semibold flex items-center gap-2 shadow-sm"
        role="banner"
      >
        <Bot size={24} aria-hidden="true" />
        <span>Election Assistant</span>
      </div>

      {/* Error banner */}
      {error && (
        <div role="alert" className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Message list */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm flex gap-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="mt-1 flex-shrink-0 text-blue-600" aria-hidden="true">
                  <Bot size={20} />
                </div>
              )}
              <div className="prose prose-sm prose-blue leading-relaxed max-w-none text-inherit">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === 'user' && (
                <div className="mt-1 flex-shrink-0" aria-hidden="true">
                  <User size={20} />
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
            role="status"
            aria-label="Assistant is typing"
          >
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none p-4 shadow-sm border border-gray-100 flex gap-2 items-center">
              <Loader2 className="animate-spin text-blue-600" size={20} aria-hidden="true" />
              <span className="text-sm text-gray-500">Assistant is typing…</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
          role="search"
          aria-label="Ask the election assistant"
        >
          <label htmlFor="chat-input" className="sr-only">
            Ask a question about the Indian election process
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about voter registration, election dates…"
            maxLength={2000}
            autoComplete="off"
            aria-label="Your question"
            disabled={isLoading}
            className="flex-1 rounded-xl border-2 border-gray-300 bg-white text-black placeholder-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Send size={20} aria-hidden="true" />
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2 text-right">
          {input.length}/2000
        </p>
      </div>
    </section>
  );
}
