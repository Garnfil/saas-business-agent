import {NextResponse} from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY!});

export async function POST(req: Request) {
    try {
        const {text, voice} = await req.json();

        if (!text || typeof text !== "string" || text.trim() === "") {
            return NextResponse.json(
                {error: "Missing or invalid text input"},
                {status: 400}
            );
        }

        if (
            !voice ||
            typeof voice !== "string" ||
            ![
                "alloy",
                "ash",
                "ballad",
                "coral",
                "echo",
                "fable",
                "nova",
                "onyx",
                "sage",
                "shimmer",
            ].includes(voice)
        ) {
            return NextResponse.json(
                {error: "Invalid voice selection"},
                {status: 400}
            );
        }

        // Create speech. The OpenAI SDK returns a fetch Response-like object with a readable body.
        const speech = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice as any,
            input: text,
            response_format: "mp3",
        });

        // Stream directly without fully buffering to reduce TTFB.
        return new Response(speech.body as any, {
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
