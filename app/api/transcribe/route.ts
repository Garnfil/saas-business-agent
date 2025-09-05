import {NextResponse} from "next/server";
import OpenAI from "openai";
// Removed filesystem usage to avoid disk I/O and speed up request handling

export const runtime = 'edge';

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY!});

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("audio") as File;

        if (!file) {
            return NextResponse.json(
                {error: "No audio file provided"},
                {status: 400}
            );
        }

        // Convert to a Web File compatible with OpenAI SDK (avoid disk I/O)
        const arrayBuffer = await file.arrayBuffer();
        const webFile = new File([arrayBuffer], file.name || "audio.webm", {
            type: file.type || "audio/webm",
        });

        // Whisper-1 is robust; set low temperature for deterministic output.
        // If you have access, consider "gpt-4o-mini-transcribe" for even lower latency.
        const transcription = await openai.audio.transcriptions.create({
            file: webFile as any,
            model: "whisper-1",
            temperature: 0,
        } as any);

        return NextResponse.json({text: transcription.text});
    } catch (error) {
        console.error("Transcription error:", error);
        return NextResponse.json(
            {error: "Transcription failed."},
            {status: 500}
        );
    }
}
