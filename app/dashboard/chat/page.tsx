"use client";

import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard-header";
import { Icons } from "@/components/icons";
import { Bot, Send } from "lucide-react";
import { runAgent } from "@/lib/actions/runAgent";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { VoiceSelect } from "@/components/voice-select";
import ChatBox from "../../../components/chat-box";
import ResponseStyleDialog from "@/components/response-style-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUser } from "@/lib/actions/auth/getUser";


type Message = {
  id: string;
  role: "user" | "bot";
  parts: { type: "text"; text: string }[];
  usage?: {
    tokens?: number;
    amount?: number;
  }
};

export default function ChatPage() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [voice, setVoice] = useState("shimmer");
  const [selectedResponseStyle, setSelectedResponseStyle] = useState("")
  const [user, setUser] = useState({
    id: '',
    tenant_id: '',
    name: '',
    email: '',
    phone_number: '',
  });

  const [showRecordingButtons, setShowRecordingButtons] =
    useState(true);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [currentAudio, setCurrentAudio] =
    useState<HTMLAudioElement | null>(null);
  const [showControls, setShowControls] = useState(false);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const ttsReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speakingText, setSpeakingText] = useState<string>("");

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
    const responseStyle = sessionStorage.getItem("responseStyle") ?? "";
    setSelectedResponseStyle(responseStyle);
  }, [messages]);

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getUser();
      if (result.status === "success") {
        setUser(result.response.data);
      }
    };
    fetchUser();
  }, []);

  const createMessage = (
    role: Message["role"],
    text: string
  ): Message => ({
    id: Date.now().toString(),
    role,
    parts: [{ type: "text", text }],
  });

  const handleQuickAction = async (action: string) => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      createMessage("user", action),
    ]);
    setInput(action);

    handleRunAgent(action);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = createMessage("user", input);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    handleRunAgent(input, userMessage.id);
  };

  const handleRunAgent = async (input: string, messageId?: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          responseStyle: selectedResponseStyle,
          userTenantId: user?.tenant_id,
          userGoogleAuth: {
            accessToken: localStorage.getItem("google_access_token"),
            refreshToken: localStorage.getItem("google_refresh_token"),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent request failed (${response.status})`);
      }

      const data = await response.json();
      const finalMessage: string = data?.message ?? "";

      // Append a single bot message with the final output
      setMessages((prev) => [
        ...prev,
        createMessage("bot", finalMessage || "(No content)")
      ]);

      return finalMessage || null;
    } catch (error) {
      console.log(error);
      const errorMessage = createMessage(
        "bot",
        "Sorry, something went wrong."
      );
      setMessages((prev) => [...prev, errorMessage]);
      return null;
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    // Prefer an explicit, broadly supported codec to avoid transcoding delays
    let mediaRecorder: MediaRecorder;
    const preferredMime = "audio/webm;codecs=opus";
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(preferredMime)) {
      mediaRecorder = new MediaRecorder(stream, { mimeType: preferredMime });
    } else {
      mediaRecorder = new MediaRecorder(stream);
    }
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      setRecording(false); // Stop recording indicator
      const blob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      try {
        // Only show loading for the transcription process
        setLoading(true);

        // First, get the transcription
        const transcriptionRes = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const transcription = await transcriptionRes.json();
        if (!transcription.text) {
          throw new Error('No transcription text received');
        }

        // Now that we have the transcription, update the UI
        setInput(transcription.text);
        setMessages((prev) => [
          ...prev,
          createMessage("user", transcription.text),
        ]);

        // Set loading for the agent response
        setIsLoading(true);
        
        try {
          const finalText = await handleRunAgent(transcription.text);
          if (voiceEnabled && finalText) {
            await speakReply(finalText);
          }
        } catch (error) {
          console.error('Error running agent:', error);
        }
      } catch (error) {
        console.error('Error in transcription:', error);
        // Show error to user
        setMessages(prev => [...prev, createMessage("bot", "Sorry, I couldn't process that audio. Please try again.")]);
      } finally {
        // Ensure loading states are always reset
        setLoading(false);
        setIsLoading(false);
      }
    };

    mediaRecorder.start();
    setRecording(true); // ⬅️ Start indicator
    mediaRecorderRef.current = mediaRecorder;
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const speakReply = async (text: string) => {
    // Stop any current playback and pending requests
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      if (ttsAbortRef.current) {
        ttsAbortRef.current.abort();
      }
    } catch { /* noop */ }

    const controller = new AbortController();
    ttsAbortRef.current = controller;

    // Indicate we're preparing speech and surface the text immediately
    setSpeakingText(text);
    setIsSpeaking(true);

    const res = await fetch("/api/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error("TTS request failed");
      setIsSpeaking(false);
      setSpeakingText("");
      return;
    }

    // If browser supports MediaSource for mp3, stream for lower latency
    const canStream = typeof window !== 'undefined' && 'MediaSource' in window && (window as any).MediaSource?.isTypeSupported?.("audio/mpeg");
    if (canStream && res.body) {
      const mediaSource = new MediaSource();
      const audioEl = audioRef.current ?? new Audio();
      const objectUrl = URL.createObjectURL(mediaSource);
      audioEl.src = objectUrl;
      setCurrentAudio(audioEl);
      audioEl.onended = () => {
        setIsSpeaking(false);
        setCurrentAudio(null);
        setSpeakingText("");
        try { URL.revokeObjectURL(objectUrl); } catch { }
      };

      mediaSource.addEventListener('sourceopen', async () => {
        const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
        const reader = res.body!.getReader();
        ttsReaderRef.current = reader;

        const pump = async (): Promise<void> => {
          try {
            const { value, done } = await reader.read();
            if (done) {
              try { mediaSource.endOfStream(); } catch { }
              return;
            }
            // queue append and wait until updateend to append next chunk
            await new Promise<void>((resolve, reject) => {
              const onError = () => { sourceBuffer.removeEventListener('error', onError as any); reject(new Error('SourceBuffer error')); };
              const onUpdateEnd = () => { sourceBuffer.removeEventListener('updateend', onUpdateEnd); resolve(); };
              sourceBuffer.addEventListener('updateend', onUpdateEnd, { once: true });
              sourceBuffer.addEventListener('error', onError as any, { once: true });
              try { sourceBuffer.appendBuffer(value!); } catch (e) { reject(e as any); }
            });
            await pump();
          } catch (e) {
            // aborted or error
            try { mediaSource.endOfStream(); } catch { }
          }
        };

        pump();
      }, { once: true });

      // Attempt playback; browser will start when enough buffered
      try {
        await (audioRef.current ?? audioEl).play();
      } catch (e) {
        // Autoplay might be blocked; show speaking text and wait for user
        console.warn('Autoplay blocked, waiting for user interaction to start audio.');
      }
      return;
    }

    // Fallback: buffer the whole response
    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audioEl = audioRef.current ?? new Audio();
    audioEl.src = audioUrl;
    audioEl.onended = () => {
      setIsSpeaking(false);
      setCurrentAudio(null);
      setSpeakingText("");
      try { URL.revokeObjectURL(audioUrl); } catch { }
    };
    setCurrentAudio(audioEl);
    try {
      await audioEl.play();
    } catch (e) {
      console.warn('Autoplay blocked, waiting for user interaction to start audio.');
    }
  };

  const stopSpeaking = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsSpeaking(false);
      setCurrentAudio(null);
    }
    try {
      if (ttsAbortRef.current) {
        ttsAbortRef.current.abort();
        ttsAbortRef.current = null;
      }
      if (ttsReaderRef.current) {
        // No direct cancel on reader when aborted, but clear ref
        ttsReaderRef.current = null;
      }
    } catch { /* noop */ }
    setSpeakingText("");
  };

  // Inline controls now manage input/voice modes directly within the input field

  // Handle response style selection changes
  const handleResponseStyleChanged = (value: string) => {
    setSelectedResponseStyle(value);
    try {
      sessionStorage.setItem("responseStyle", value);
    } catch (e) {
      console.warn("Unable to persist response style to sessionStorage", e);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-x-hidden">
      <ResponseStyleDialog session={false} />
      <DashboardHeader title="Chat" />

      <div
        className="flex-1 mx-auto h-[600px] grid gap-4 min-h-0 min-w-[300px] max-w-[600px] md:min-w-[72rem] md:max-w-6xl"
        style={{ gridTemplateColumns: showControls ? "1fr 400px" : "1fr" }}
      >
        <Card className="py-0 flex-1 flex flex-col backdrop-blur-sm rounded-none border-none min-h-0">
          <CardHeader
            style={{
              padding: "5px 10px",
              paddingBottom: 0,
            }}
            className=" flex justify-start items-center"
          >
            <CardTitle className="flex w-full justify-end items-center pb-2 pt-2 gap-2 text-violet-100 text-base md:text-lg">

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="bg-transparent"
              >
                {showControls ? (
                  <>
                    <Icons.x className="w-4 h-4 mr-2" />
                    Hide Controls
                  </>
                ) : (
                  <>
                    <Icons.book className="w-4 h-4 mr-2" />
                    Show Controls
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Hidden audio element for reliable playback context */}
            <audio ref={audioRef} className="hidden" />

            <ChatBox
              messages={messages}
              isLoading={isLoading}
              isSpeaking={isSpeaking}
              stopSpeaking={stopSpeaking}
              onQuickAction={handleQuickAction}
            />
          </CardContent>

          <CardFooter className="gap-3 md:p-4">
            <form onSubmit={handleSubmit} className="flex w-full items-center">
              <div className="relative flex-1">
                <Textarea
                  rows={1}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  disabled={isLoading}
                  className="flex-1 pr-28 bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder:text-slate-400 text-sm md:text-base min-h-[35px] py-5 max-h-[160px] rounded-xl focus-visible:ring-1 focus-visible:ring-violet-500"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowRecordingButtons(!showRecordingButtons)}
                    className={`h-9 w-9 rounded-full border border-slate-600/60 ${showRecordingButtons ? "bg-slate-700/60" : "bg-transparent"}`}
                    title={showRecordingButtons ? "Typing Mode" : "Voice Mode"}
                  >
                    <Image src={showRecordingButtons ? "/images/types.png" : "/images/mic.png"} alt="mode" width={18} height={18} />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => (recording ? stopRecording() : startRecording())}
                    disabled={loading}
                    className={`h-9 w-9 rounded-full border border-slate-600/60 ${recording ? "bg-red-900/60" : "bg-transparent"}`}
                    title={recording ? "Stop Recording" : "Start Recording"}
                  >
                    <Image src="/images/mic.png" alt="microphone" width={18} height={18} />
                  </Button>

                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="h-9 w-9 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25"
                    title="Send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </form>
          </CardFooter>
        </Card>

        {showControls && (
          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.settings className="w-5 h-5" />
                  Response Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <VoiceSelect onVoiceChange={setVoice} defaultVoice="shimmer" />
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Voice Responses</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={voiceEnabled ? "bg-green-500 text-white" : "bg-transparent"}
                  >
                    {voiceEnabled ? "On" : "Off"}
                  </Button>
                </div>
                <div className="my-2">
                  <Label>Response Style</Label>
                  <div className="mt-2">
                    <Select value={selectedResponseStyle} onValueChange={handleResponseStyleChanged}>
                      <SelectTrigger>
                        <SelectValue placeholder="Prefered Response Style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Direct & Concise">Direct & Concise</SelectItem>
                        <SelectItem value="Action-Oriented">Action Oriented</SelectItem>
                        <SelectItem value="Comprehensive & Detailed">Detailed & Comprehensive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>



            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Listening</span>
                    <Badge variant={recording ? "destructive" : "secondary"}>
                      {recording ? "Active" : "Ready"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Processing</span>
                    <Badge variant={isLoading ? "default" : "secondary"}>
                      {isLoading ? "Working" : "Idle"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Speaking</span>
                    <Badge variant={isSpeaking ? "default" : "secondary"}>
                      {isSpeaking ? "Active" : "Silent"}
                    </Badge>
                  </div>
                  {speakingText && (
                    <div className="text-xs text-slate-300 mt-2 line-clamp-3" title={speakingText}>
                      {speakingText}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );

}
