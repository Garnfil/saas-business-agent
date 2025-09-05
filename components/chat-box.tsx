"use client";

import React, { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Bot, StopCircle, User } from 'lucide-react';
import MarkdownRenderer from './markdown-renderer';
import { Button } from './ui/button';
import AIResponse, { StructuredAIResponse } from './ai-response';
import { cn } from '@/lib/utils';

interface ChatBoxProps {
  messages: Array<{
    id: string;
    role: 'user' | 'bot';
    parts: Array<{
      type: 'text';
      text: string;
    }>;
  }>;
  isLoading: boolean;
  isSpeaking: boolean;
  stopSpeaking: () => void;
  onQuickAction?: (text: string) => void;
}

export default function ChatBox({ messages, isLoading, isSpeaking, stopSpeaking, onQuickAction }: ChatBoxProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(0);

  const loadingMessages = [
    { text: "Crunching those numbers with a smile! ", emoji: "✨" },
    { text: "Working my magic on your business query...", emoji: "🔮" },
    { text: "Gathering insights from your data sources...", emoji: "📊" },
    { text: "Polishing up the perfect response for you!", emoji: "✨" },
    { text: "Connecting the dots in your business data...", emoji: "🔗" },
    { text: "Brewing some fresh insights for you...", emoji: "☕" }
  ] as const;

  const LoadingText = ({ text, emoji }: { text: string; emoji: string }) => (
    <div className="relative inline-flex items-center">
      <span className="shimmer-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
        {text}
      </span>
      <span className="ml-1.5 text-yellow-200 animate-pulse">{emoji}</span>
    </div>
  );

  useEffect(() => {
    if (!isLoading) return;
    setLoadingIndex(0);
    const interval = setInterval(() => {
      setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Try to extract a fenced JSON block from the text and parse it
  const parseStructured = (text: string): StructuredAIResponse | null => {
    // Match the last fenced json block ```json ... ```
    const regex = /```json\s*([\s\S]*?)\s*```/gi;
    let match: RegExpExecArray | null = null;
    let last: string | null = null;
    while ((match = regex.exec(text)) !== null) {
      last = match[1];
    }
    if (!last) return null;
    try {
      const obj = JSON.parse(last);
      if (obj && typeof obj === 'object' && 'answer' in obj) {
        return {
          sources: Array.isArray(obj.sources) ? obj.sources : [],
          asset: obj.asset ?? null,
          answer: String(obj.answer ?? ''),
        } as StructuredAIResponse;
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const quickActions: string[] = [
    "Generate this week's sales summary",
    "Show top 10 customers",
    "Create monthly financial report",
    "Show pending & completed tasks",
    "List unpaid and overdue invoices",
    "Summarize all of projects this month",
    "List all of my active employees",
    "Give a Business Insights",
  ];

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-2 md:p-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center flex flex-col items-center justify-center gap-2 py-10 mt-10">
              <div className="relative w-[200px] h-[100px] flex items-center justify-center">
                {/* Glow layers */}
                <div className="absolute inset-0 rounded-[20px] bg-violet-900/20 blur-2xl" />
                <div className="absolute -inset-5 rounded-[20px] bg-violet-800/15 blur-3xl" />
                <div className="absolute -inset-5 rounded-[20px] bg-violet-700/10 blur-3xl" />
                <Image
                  src="/sam-logo-white.png"
                  alt="Sam Logo"
                  width={200}
                  height={200}
                  className="relative z-10"
                />
              </div>
              {/* Quick Actions/Buttons */}
              <div className="mt-4 max-w-[900px] flex flex-wrap items-center justify-center gap-2 px-2">
                {quickActions.map((qa) => (
                  <Button
                    key={qa}
                    type="button"
                    variant="outline"
                    className="h-10 rounded-full border-slate-600/50 bg-transparent text-slate-200 hover:bg-slate-800/60 hover:text-slate-100"
                    onClick={() => onQuickAction?.(qa)}
                  >
                    {qa}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-6">
            {messages.map(
              (message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 md:gap-4 ${message.role ===
                    "user"
                    ? "flex-row-reverse"
                    : "flex-row"
                    }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${message.role ===
                      "user"
                      ? "bg-[#071A3D] text-white shadow-lg shadow-violet-500/25"
                      : "bg-slate-800/40 text-violet-300 border border-violet-500/30"
                      }`}
                  >
                    {message.role ===
                      "user" ? (
                      <User className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <Bot className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </div>

                  <div
                    className={`flex-1 max-w-[98vw] xs:max-w-[90%] md:max-w-[80%] ${message.role ===
                      "user"
                      ? "text-right"
                      : "text-left"
                      }`}
                  >
                    <div
                      className={`inline-block p-2 md:p-4 rounded-2xl text-sm md:text-base ${message.role ===
                        "user"
                        ? "bg-[#071A3D] text-white rounded-br-md shadow-lg shadow-violet-900/25"
                        : "bg-slate-800/40 text-slate-100 rounded-bl-md border border-violet-500/20"
                        }`}
                    >
                      {message.parts.map(
                        (
                          part,
                          i
                        ) => {
                          switch (
                          part.type
                          ) {
                            case "text":
                              return (
                                <div
                                  key={`${message.id}-${i}`}
                                  className="whitespace-wrap"
                                >
                                  {/* Render structured response if available, else markdown */}
                                  {(() => {
                                    const structured = parseStructured(part.text);
                                    if (structured) {
                                      return <AIResponse data={structured} />;
                                    }
                                    return (
                                      <MarkdownRenderer>
                                        {part.text.replace(/\)\s*"\s*$/, ")")}
                                      </MarkdownRenderer>
                                    );
                                  })()}
                                  {/* 👇 Add Stop Audio button here */}
                                  {isSpeaking &&
                                    message.role ===
                                    "bot" && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Stop Speaking"
                                        onClick={
                                          stopSpeaking
                                        }
                                        className="mt-2 text-xs text-red-400 "
                                      >
                                        <StopCircle
                                          color="red"
                                          size={
                                            20
                                          }
                                        />
                                      </Button>
                                    )}
                                </div>
                              );
                            default:
                              return null;
                          }
                        }
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

            {/* 👇 Scroll anchor */}
            <div
              ref={bottomRef}
            ></div>

            {isLoading && (
              <div className="flex items-start gap-3 py-4 px-4">
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2 overflow-hidden px-1">
                  <p className="font-medium">AI Assistant</p>
                  <div className="text-muted-foreground">
                    <LoadingText text={loadingMessages[loadingIndex].text} emoji={loadingMessages[loadingIndex].emoji} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer-text {
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
          background-image: linear-gradient(
            90deg,
            rgba(252, 211, 77, 0.1) 0%,
            rgba(253, 230, 138, 0.8) 25%,
            rgba(253, 230, 138, 0.8) 35%,
            rgba(252, 211, 77, 0.1) 50%,
            rgba(252, 211, 77, 0.1) 100%
          );
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          display: inline-block;
        }
      `}</style>
    </ScrollArea>
  )
}
