"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface DataSource {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  popularity: number;
  setupTime: string;
}

const dataSources: DataSource[] = [
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Connect spreadsheets for data analysis",
    icon: "📋",
    category: "Productivity",
    popularity: 95,
    setupTime: "2 min",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Connect your gmail for sending and drafting emails.",
    icon: "📧",
    category: "Productivity",
    popularity: 88,
    setupTime: "3 min",
  },
];

interface DataSourceSelectorProps {
  selectedSource?: string;
  onSourceSelect: (sourceId: string) => void;
  onSkip?: () => void;
}

export function DataSourceSelector({
  selectedSource,
  onSourceSelect,
  onSkip,
}: DataSourceSelectorProps) {
  const [hoveredSource, setHoveredSource] = useState<string | null>(
    null
  );
  const router = useRouter();

  const handleCreateConnection = () => {
    if (selectedSource) {
      router.push(`/dashboard/data-sources/configure/${selectedSource}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          Connect Your First Data Source
        </h3>
        <p className="text-slate-400 mb-6">
          Choose a data source to get started. You can add
          more connections later.
        </p>
      </div>

      {/* Connections Visualization */}
      <div className="relative bg-slate-900/50 rounded-xl p-8 border border-slate-700">
        <div className="text-center mb-6">
          <h4 className="text-lg font-medium text-white mb-2">
            <span className="text-blue-400">
              Connections
            </span>{" "}
            link Sources to Destinations
          </h4>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex items-center gap-8">
            {/* Sources */}
            <div className="flex flex-col gap-4">
              <div className="text-sm text-slate-400 mb-2 text-center">
                Sources
              </div>
              <div className="space-y-3">
                {dataSources
                  .slice(0, 3)
                  .map((source) => (
                    <div
                      key={source.id}
                      className={`w-12 h-12 bg-white rounded-lg flex items-center justify-center text-xl cursor-pointer transition-all hover:scale-105 ${selectedSource ===
                        source.id
                        ? "ring-2 ring-blue-400 scale-110"
                        : ""
                        }`}
                      onClick={() =>
                        onSourceSelect(
                          source.id
                        )
                      }
                      title={source.name}
                    >
                      {source.icon}
                    </div>
                  ))}

              </div>
            </div>

            {/* Connection Lines */}
            <div className="relative">
              <svg
                width="200"
                height="90"
                className="overflow-visible"
              >
                <defs>
                  <linearGradient
                    id="gradient1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#8b5cf6"
                    />
                    <stop
                      offset="100%"
                      stopColor="#3b82f6"
                    />
                  </linearGradient>
                  <linearGradient
                    id="gradient2"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#3b82f6"
                    />
                    <stop
                      offset="100%"
                      stopColor="#ef4444"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M 20 30 Q 100 10 180 60"
                  stroke="url(#gradient1)"
                  strokeWidth="3"
                  fill="none"
                  className="opacity-80"
                />
                <path
                  d="M 20 90 Q 100 110 180 60"
                  stroke="url(#gradient2)"
                  strokeWidth="3"
                  fill="none"
                  className="opacity-80"
                />
                <circle
                  cx="20"
                  cy="30"
                  r="4"
                  fill="#8b5cf6"
                />
                <circle
                  cx="20"
                  cy="90"
                  r="4"
                  fill="#ef4444"
                />
                <circle
                  cx="180"
                  cy="60"
                  r="4"
                  fill="#3b82f6"
                />
              </svg>
            </div>

            {/* Central Hub */}
            <div className="w-16 h-16 bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center border border-slate-600">
              <div className="w-8 h-8 text-blue-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                </svg>
              </div>
            </div>

            {/* Connection Lines */}
            <div className="relative">
              <svg width="200" height="120" className="overflow-visible">
                <path stroke="url(#gradient1)" strokeWidth="3" fill="none" className="opacity-80" d="M 17 60 Q 50 50 180 59"></path>
                <circle cx="20" cy="60" r="4" fill="#3b82f6"></circle>
                <circle cx="180" r="4" fill="#8b5cf6" cy="60"></circle>
              </svg>
            </div>

            {/* Destinations */}
            <div className="flex flex-col gap-4">
              <div className="text-sm text-slate-400 mb-2 text-center">
                Destinations
              </div>
              <div className="space-y-3">
                <Image src="./sam-logo-white.png" width={100} height={100} alt="Sam" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Grid */}
      <div className="flex gap-3 justify-center">
        {dataSources.map((source) => (
          <Card
            key={source.id}
            className={`w-[250px] cursor-pointer transition-all hover:shadow-lg ${selectedSource === source.id
              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
              : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            onClick={() => onSourceSelect(source.id)}
            onMouseEnter={() =>
              setHoveredSource(source.id)
            }
            onMouseLeave={() => setHoveredSource(null)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">
                  {source.icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant="outline"
                    className="text-xs"
                  >
                    {source.category}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {source.setupTime} setup
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-white mb-2">
                {source.name}
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                {source.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-500">
                    {source.popularity}% popular
                  </span>
                </div>
                {selectedSource === source.id && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSource && (
        <div className="text-center">
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white"
            onClick={handleCreateConnection}
          >
            Create your first connection
          </Button>
        </div>
      )}
    </div>
  );
}
