"use client";

import {Label} from "@/components/ui/label";

import {useState, useRef, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Slider} from "@/components/ui/slider";
import {DashboardHeader} from "@/components/dashboard-header";
import {CanvasResponse} from "@/components/canvas-response";
import {Icons} from "@/components/icons";
import {useToast} from "@/hooks/use-toast";
import {Bot, Send, StopCircle, User} from "lucide-react";
import {runAgent} from "@/lib/actions/runAgent";
import Image from "next/image";
import MarkdownRenderer from "@/components/markdown-renderer";
import {Textarea} from "@/components/ui/textarea";
import {VoiceSelect} from "@/components/voice-select";

type Message = {
    id: string;
    role: "user" | "bot";
    parts: {type: "text"; text: string}[];
};

export default function VoiceAssistantPage() {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [voiceSpeed, setVoiceSpeed] = useState([1]);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [recording, setRecording] = useState(false);
    const [voice, setVoice] = useState("shimmer");
    const [showInputForm, setShowInputForm] = useState(true);

    const [showRecordingButtons, setShowRecordingButtons] =
        useState(false);

    const bottomRef = useRef<HTMLDivElement | null>(null);

    const [currentAudio, setCurrentAudio] =
        useState<HTMLAudioElement | null>(null);
    const [currentTranscript, setCurrentTranscript] = useState("");
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const {toast} = useToast();

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages]);

    const createMessage = (
        role: Message["role"],
        text: string
    ): Message => ({
        id: Date.now().toString(),
        role,
        parts: [{type: "text", text}],
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

        handleRunAgent(input);
    };

    const handleRunAgent = async (input: string) => {
        try {
            const response = await fetch("/api/run-agent", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({input}),
            });

            if (!response.body)
                throw new Error("Stream not supported");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let accumulatedText = "";
            let botMessageAdded = false;

            while (true) {
                const {value, done} = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, {stream: true});

                if (chunk.includes("[INTERRUPTION]")) {
                    console.log(
                        "Interruption detected: approval required."
                    );
                    break; // Or handle interruption approval flow
                }

                accumulatedText += chunk;

                setMessages((prev) => {
                    const updated = [...prev];

                    if (!botMessageAdded) {
                        // Add bot message when first chunk arrives
                        updated.push({
                            id: `bot-${Date.now()}`,
                            role: "bot",
                            parts: [
                                {type: "text", text: accumulatedText},
                            ],
                        });
                        botMessageAdded = true;
                    } else {
                        // Update existing bot message
                        updated[updated.length - 1] = {
                            ...updated[updated.length - 1],
                            parts: [
                                {type: "text", text: accumulatedText},
                            ],
                        };
                    }

                    return updated;
                });
            }
        } catch (error) {
            const errorMessage = createMessage(
                "bot",
                "Sorry, something went wrong."
            );
            setMessages((prev) => [...prev, errorMessage]);
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
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            setRecording(false); // ⬅️ Stop indicator
            const blob = new Blob(audioChunksRef.current, {
                type: "audio/webm",
            });
            const formData = new FormData();
            formData.append("audio", blob, "recording.webm");

            setLoading(true);

            const transcriptionRes = await fetch("/api/transcribe", {
                method: "POST",
                body: formData,
            });

            const transcription = await transcriptionRes.json();
            if (transcription.text) {
                setInput(transcription.text);
                console.log(transcription.text);

                setMessages((prev) => [
                    ...prev,
                    createMessage("user", transcription.text),
                ]);

                const botResponse = await runAgent(
                    transcription.text
                );
                const botMessage = createMessage(
                    "bot",
                    botResponse || ""
                );

                setMessages((prev) => [...prev, botMessage]);

                speakReply(botResponse || "");
            }

            setLoading(false);
        };

        mediaRecorder.start();
        setRecording(true); // ⬅️ Start indicator
        mediaRecorderRef.current = mediaRecorder;
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
    };

    const speakReply = async (text: string) => {
        const res = await fetch("/api/synthesize", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({text, voice}), // Add voice to the request
        });

        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
            setIsSpeaking(false);
            setCurrentAudio(null);
        };

        setCurrentAudio(audio);
        audio.play();
    };

    const stopSpeaking = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setIsSpeaking(false);
            setCurrentAudio(null);
        }
    };

    const toggleInputForm = () => {
        setShowInputForm(true);
        setShowRecordingButtons(false);
    };

    const toggleRecordingButtons = () => {
        setShowInputForm(false);
        setShowRecordingButtons(true);
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <DashboardHeader title="Chat" />

            <div className="grid gap-4 md:grid-cols-4">
                <div className="flex-1 h-[600px] flex flex-col min-h-0 max-w-full md:col-span-3">
                    <Card className="py-0 flex-1  flex flex-col  backdrop-blur-sm rounded-none  min-h-0">
                        <CardHeader
                            style={{
                                padding: "5px 10px",
                                paddingBottom: 0,
                            }}
                            className="border-b flex justify-start items-center bg-slate-800/50"
                        >
                            <CardTitle className="flex w-full justify-between items-center pb-3 md:pb-5 pt-2 gap-2 text-violet-100 text-base md:text-lg">
                                <div className="flex items-center gap-2">
                                    <Bot className="w-5 h-5 text-violet-400" />
                                    <span className=" xs:inline">
                                        AI Business Assistant
                                    </span>
                                </div>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
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
                                                        className={`flex items-start gap-2 md:gap-4 ${
                                                            message.role ===
                                                            "user"
                                                                ? "flex-row-reverse"
                                                                : "flex-row"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                                                                message.role ===
                                                                "user"
                                                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
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
                                                            className={`flex-1 max-w-[98vw] xs:max-w-[90%] md:max-w-[80%] ${
                                                                message.role ===
                                                                "user"
                                                                    ? "text-right"
                                                                    : "text-left"
                                                            }`}
                                                        >
                                                            <div
                                                                className={`inline-block p-2 md:p-4 rounded-2xl text-sm md:text-base ${
                                                                    message.role ===
                                                                    "user"
                                                                        ? "bg-violet-600 text-white rounded-br-md shadow-lg shadow-violet-900/25"
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
                                                                                                part.text
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
                        </CardContent>

                        <CardFooter className="gap-3  border-t border-violet-500/20 bg-slate-800/50 p-2 md:p-4">
                            <div className="flex justify-center items-center gap-2">
                                <Button
                                    onClick={toggleRecordingButtons}
                                    className={`hover:bg-slate-800/20 py-5 px-3 bg-slate-800 rounded border ${
                                        showRecordingButtons
                                            ? "border-violet-500"
                                            : "border-violet-500/30"
                                    }`}
                                >
                                    <Image
                                        src="/images/mic.png"
                                        alt="microphone"
                                        width={20}
                                        height={20}
                                    />
                                </Button>
                                <Button
                                    onClick={toggleInputForm}
                                    className={`hover:bg-slate-800/20 py-5 px-3 bg-slate-800 rounded border ${
                                        showInputForm
                                            ? "border-violet-500"
                                            : "border-violet-500/30"
                                    }`}
                                >
                                    <Image
                                        src="/images/types.png"
                                        alt="type"
                                        width={20}
                                        height={20}
                                    />
                                </Button>
                            </div>

                            {showInputForm && (
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex w-full flex-1 gap-1 md:gap-3"
                                >
                                    <Textarea
                                        rows={1}
                                        value={input}
                                        onChange={handleInputChange}
                                        placeholder="Type your message..."
                                        disabled={isLoading}
                                        className="flex-1 bg-slate-700/50 border-violet-500/30 text-slate-100 placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 text-sm md:text-base min-h-[38px] max-h-[120px]"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={
                                            isLoading || !input.trim()
                                        }
                                        className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25 px-3 md:px-5 min-h-[38px]"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            )}

                            {showRecordingButtons && (
                                <>
                                    <div className="flex w-full flex-1 items-center gap-2 m-3">
                                        {recording && (
                                            <span className="text-red-600 font-bold animate-pulse">
                                                ● Recording...
                                            </span>
                                        )}
                                        {!recording && !loading && (
                                            <span className="text-gray-500">
                                                Idle
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            className="bg-violet-900 hover:bg-violet-900 border border-violet-900 text-white px-4 py-2 rounded"
                                            onClick={startRecording}
                                            disabled={
                                                recording || loading
                                            }
                                        >
                                            🎙️ Start Recording
                                        </Button>
                                        <Button
                                            className="bg-red-900 text-white px-4 py-2 rounded"
                                            onClick={stopRecording}
                                            disabled={
                                                !recording || loading
                                            }
                                        >
                                            ⏹️ Stop Recording
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardFooter>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Icons.settings className="w-5 h-5" />
                                Voice Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <VoiceSelect
                                onVoiceChange={setVoice}
                                defaultVoice="shimmer"
                            />
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">
                                    Voice Responses
                                </Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setVoiceEnabled(!voiceEnabled)
                                    }
                                    className={
                                        voiceEnabled
                                            ? "bg-green-500 text-white"
                                            : "bg-transparent"
                                    }
                                >
                                    {voiceEnabled ? "On" : "Off"}
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">
                                    Speech Speed
                                </Label>
                                <Slider
                                    value={voiceSpeed}
                                    onValueChange={setVoiceSpeed}
                                    max={2}
                                    min={0.5}
                                    step={0.1}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Slow</span>
                                    <span>Normal</span>
                                    <span>Fast</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Icons.zap className="w-5 h-5" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start bg-transparent"
                                onClick={() =>
                                    handleQuickAction(
                                        "Show me today's invoice report"
                                    )
                                }
                            >
                                <Icons.barChart className="w-4 h-4 mr-2" />
                                Invoice Report
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start bg-transparent"
                                onClick={() =>
                                    handleQuickAction(
                                        "What are the latest customer insights?"
                                    )
                                }
                            >
                                <Icons.users className="w-4 h-4 mr-2" />
                                Customer Insights
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start bg-transparent"
                                onClick={() =>
                                    handleQuickAction(
                                        "Generate a business summary"
                                    )
                                }
                            >
                                <Icons.fileText className="w-4 h-4 mr-2" />
                                Business Summary
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start bg-transparent"
                                onClick={() =>
                                    handleQuickAction(
                                        "What are completed tasks for this week?"
                                    )
                                }
                            >
                                <Icons.trendingUp className="w-4 h-4 mr-2" />
                                Completed Tasks
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">
                                        Listening
                                    </span>
                                    <Badge
                                        variant={
                                            isListening
                                                ? "destructive"
                                                : "secondary"
                                        }
                                    >
                                        {isListening
                                            ? "Active"
                                            : "Ready"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">
                                        Processing
                                    </span>
                                    <Badge
                                        variant={
                                            true
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {true ? "Working" : "Idle"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">
                                        Speaking
                                    </span>
                                    <Badge
                                        variant={
                                            true
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {true ? "Active" : "Silent"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
