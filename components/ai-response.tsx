"use client";

import React from "react";
import MarkdownRenderer from "./markdown-renderer";
import { cn } from "@/lib/utils";

export type StructuredAIResponse = {
  sources: Array<{
    title: string;
    url: string;
    favicon?: string;
  }>;
  asset?: {
    name: string;
    symbol?: string;
    price?: string;
    change_pct?: number; // e.g. 8.6 for 8.6%
    sparkline_svg?: string; // optional inline svg path data
  } | null;
  answer: string; // markdown text
};

export default function AIResponse({ data }: { data: StructuredAIResponse }) {
  const { sources = [], asset, answer } = data || {} as StructuredAIResponse;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Sources Section */}
      {sources?.length > 0 && (
        <div className="rounded-2xl border border-slate-600/30 bg-transparent p-3 md:p-4">
          <div className="text-slate-200 font-semibold mb-3 md:mb-4">Sources</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {sources.map((s, idx) => (
              <a
                key={`${s.url}-${idx}`}
                href={`#`}
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-slate-600/30 bg-slate-900/50 px-3 py-3 hover:border-violet-500/40 hover:bg-slate-900/70 transition-colors"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">●</div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm text-slate-100 group-hover:text-white">{s.title || s.url}</div>
                  <div className="text-xs text-slate-400">Source Link</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Asset Header Card */}
      {asset && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-600/30 bg-slate-800/60 p-4 md:p-5">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 rounded-xl bg-slate-900/60 flex items-center justify-center text-slate-200 font-semibold">
              {asset?.name?.[0] || ""}
            </div>
            <div>
              <div className="text-slate-100 font-semibold">{asset?.name || ""}</div>
              {asset?.symbol && (
                <div className="text-slate-400 text-sm">{asset.symbol}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {typeof asset.change_pct === "number" && (
              <div
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  asset.change_pct >= 0
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-rose-500/15 text-rose-300"
                )}
              >
                {asset.change_pct.toFixed(1)}%
              </div>
            )}
            {asset?.price && (
              <div className="text-slate-100 font-semibold">{asset.price}</div>
            )}
          </div>
        </div>
      )}

      {/* Answer Section */}
      <div className="rounded-2xl border border-slate-600/30 bg-transparent p-3 md:p-4">
        <div className="text-slate-300 font-semibold mb-2">Answer</div>
        <div className="prose prose-invert max-w-none">
          <MarkdownRenderer>{answer}</MarkdownRenderer>
        </div>
      </div>
    </div>
  );
}
