"use client";

import React, { useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Bot, StopCircle, User } from 'lucide-react';
import MarkdownRenderer from './markdown-renderer';
import { Button } from './ui/button';

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
}

export default function ChatBox({ messages, isLoading, isSpeaking, stopSpeaking }: ChatBoxProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);


  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-2 md:p-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center flex flex-col items-center justify-center gap-2">
              <Image
                src="/sam-logo-white.png"
                alt="Sam Logo"
                width={200}
                height={200}
              />
              <p className="text-sm md:text-lg">
                Start a
                conversation with
                the AI Business
                Assistant
              </p>
              <p className="text-xs md:text-sm">
                Ask questions
                about your data
                sources or get
                help to manage
                your business.
              </p>
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
                      : "bg-slate-700 text-violet-300 border border-violet-500/30"
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
                        : "bg-slate-700/50 text-slate-100 rounded-bl-md border border-violet-500/20"
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
                                  <MarkdownRenderer>
                                    {
                                      part.text.replace(/\)\s*"\s*$/, ")")
                                    }
                                  </MarkdownRenderer>
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
              <div className="flex items-start gap-2 md:gap-4">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-700 text-violet-300 border border-violet-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 md:p-4 rounded-2xl bg-slate-700/50 text-slate-100 rounded-bl-md border border-violet-500/20">
                    <div className="flex space-x-1 md:space-x-2">
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                        style={{
                          animationDelay:
                            "0.1s",
                        }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                        style={{
                          animationDelay:
                            "0.2s",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
