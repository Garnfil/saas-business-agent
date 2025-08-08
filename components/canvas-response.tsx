"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

interface CanvasResponseProps {
  data: {
    type: "chart" | "metrics" | "table" | "visualization"
    data: any
  }
}

export function CanvasResponse({ data }: CanvasResponseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 250

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (data.type === "chart") {
      drawChart(ctx, data.data)
    } else if (data.type === "metrics") {
      drawMetrics(ctx, data.data)
    }
  }, [data])

  const drawChart = (ctx: CanvasRenderingContext2D, chartData: any) => {
    const { labels, datasets } = chartData
    const dataset = datasets[0]
    const values = dataset.data
    const maxValue = Math.max(...values)

    // Chart dimensions
    const chartWidth = 300
    const chartHeight = 180
    const chartX = 50
    const chartY = 30
    const barWidth = chartWidth / values.length - 10

    // Draw background
    ctx.fillStyle = "#1e293b"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw title
    ctx.fillStyle = "#ffffff"
    ctx.font = "16px Inter"
    ctx.textAlign = "center"
    ctx.fillText("Sales Performance", ctx.canvas.width / 2, 20)

    // Draw bars
    values.forEach((value: number, index: number) => {
      const barHeight = (value / maxValue) * chartHeight
      const x = chartX + index * (barWidth + 10)
      const y = chartY + chartHeight - barHeight

      // Draw bar
      ctx.fillStyle = dataset.borderColor || "#10b981"
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw value on top
      ctx.fillStyle = "#ffffff"
      ctx.font = "12px Inter"
      ctx.textAlign = "center"
      ctx.fillText(value.toString(), x + barWidth / 2, y - 5)

      // Draw label
      ctx.fillStyle = "#94a3b8"
      ctx.font = "10px Inter"
      ctx.fillText(labels[index], x + barWidth / 2, chartY + chartHeight + 15)
    })

    // Draw axes
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(chartX, chartY)
    ctx.lineTo(chartX, chartY + chartHeight)
    ctx.lineTo(chartX + chartWidth, chartY + chartHeight)
    ctx.stroke()
  }

  const drawMetrics = (ctx: CanvasRenderingContext2D, metricsData: any) => {
    // Draw background
    ctx.fillStyle = "#1e293b"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw title
    ctx.fillStyle = "#ffffff"
    ctx.font = "16px Inter"
    ctx.textAlign = "center"
    ctx.fillText("Key Metrics", ctx.canvas.width / 2, 25)

    // Draw metrics
    const metrics = Object.entries(metricsData)
    const cols = 2
    const rows = Math.ceil(metrics.length / cols)
    const cellWidth = ctx.canvas.width / cols
    const cellHeight = (ctx.canvas.height - 40) / rows

    metrics.forEach(([key, value], index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = col * cellWidth + cellWidth / 2
      const y = 60 + row * cellHeight + cellHeight / 2

      // Draw metric box
      ctx.fillStyle = "#334155"
      ctx.fillRect(col * cellWidth + 10, 50 + row * cellHeight, cellWidth - 20, cellHeight - 10)

      // Draw metric label
      ctx.fillStyle = "#94a3b8"
      ctx.font = "12px Inter"
      ctx.textAlign = "center"
      ctx.fillText(key, x, y - 10)

      // Draw metric value
      ctx.fillStyle = "#10b981"
      ctx.font = "20px Inter"
      ctx.fillText(value as string, x, y + 15)
    })
  }

  if (data.type === "metrics") {
    return (
      <Card className="p-4 bg-slate-900 border-slate-700">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data.data).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-sm text-slate-400">{key}</p>
              <p className="text-2xl font-bold text-green-400">{value as string}</p>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-slate-900 border-slate-700">
      <canvas ref={canvasRef} className="w-full h-auto max-w-full rounded-lg" style={{ maxHeight: "250px" }} />
    </Card>
  )
}
