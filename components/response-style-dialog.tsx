"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ResponseStyleDialog({ session }: { session: any }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!session) {
      // if no session AND no response style stored, show dialog
      const storedStyle = sessionStorage.getItem("responseStyle")
      if (!storedStyle) {
        setOpen(true)
      }
    }
  }, [session])

  const handleSelectStyle = (style: string) => {
    sessionStorage.setItem("responseStyle", style)
    setOpen(false) // close dialog after selection
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Response Style</DialogTitle>
          <DialogDescription>
            Select your response style preference for the ultimate experience.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex justify-between items-center gap-3">
          {/* Response Style - Direct & Concise */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={() => handleSelectStyle("Direct & Concise")}
                className="flex justify-center items-center flex-col space-y-2 cursor-pointer hover:opacity-80 transition"
              >
                <Image
                  className="rounded-lg"
                  src="/images/direct_concise.png"
                  alt="Direct & Concise"
                  width={120}
                  height={120}
                />
                <div className="text-center">Direct & Concise</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="py-5" style={{ width: "300px" }}>
              <p>
                This style is ideal when you need an immediate, no-frills answer
                to a specific question. By choosing this option, you'll get
                straight to the point, saving you time and effort when you're in
                a hurry.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Response Style - Action Oriented */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={() => handleSelectStyle("Action-Oriented")}
                className="flex justify-center items-center flex-col space-y-2 cursor-pointer hover:opacity-80 transition"
              >
                <Image
                  className="rounded-lg"
                  src="/images/action_oriented.png"
                  alt="Action Oriented"
                  width={120}
                  height={120}
                />
                <div className="text-center">Action Oriented</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="py-5" style={{ width: "300px" }}>
              <p>
                Select this style if you want more than just an answer; you want
                to know what to do next. It's the best choice for users who are
                looking to move a task forward and need a clear, actionable
                recommendation to guide them.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Response Style - Comprehensive & Detailed */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={() =>
                  handleSelectStyle("Comprehensive & Detailed")
                }
                className="flex justify-center items-center flex-col space-y-2 cursor-pointer hover:opacity-80 transition"
              >
                <Image
                  className="rounded-lg"
                  src="/images/comprehensive_detailed.png"
                  alt="Comprehensive & Detailed"
                  width={120}
                  height={120}
                />
                <div className="text-center">Detailed</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="py-5" style={{ width: "300px" }}>
              <p>
                Choose this style when you need a thorough, in-depth
                explanation. This is the perfect option for analyzing complex
                data or understanding the full context behind a business trend,
                giving you a complete picture to inform your decisions.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </DialogContent>
    </Dialog>
  )
}
