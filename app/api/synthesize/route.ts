import {NextResponse} from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY!});

export async function POST(req: Request) {
    try {
        const {text} = await req.json();

        if (!text || typeof text !== "string" || text.trim() === "") {
            return NextResponse.json(
                {error: "Missing or invalid text input"},
                {status: 400}
            );
        }

        const speech = await openai.audio.speech.create({
            model: "tts-1", // or tts-1-hd for higher quality
            voice: "ash", // other voices: "echo", "onyx", "shimmer"
            input: text,
            instructions: "Speak in a cheerful and positive tone.",
            response_format: "mp3",
        });

        const audioBuffer = Buffer.from(await speech.arrayBuffer());

        return new Response(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Disposition":
                    'inline; filename="speech.mp3"',
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("TTS error", error);
        return NextResponse.json(
            {error: "Failed to synthesize speech."},
            {status: 500}
        );
    }
}
