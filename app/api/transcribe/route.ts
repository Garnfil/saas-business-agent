import {NextResponse} from "next/server";
import OpenAI from "openai";
import {Readable} from "stream";
import {writeFile} from "fs/promises";
import fs from "fs";
import path from "path";
import os from "os";

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

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save to a temporary file (required by OpenAI SDK)
        const tempFilePath = path.join(os.tmpdir(), file.name);
        await writeFile(tempFilePath, buffer);

        const transcription =
            await openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: "whisper-1",
            });

        return NextResponse.json({text: transcription.text});
    } catch (error) {
        console.error("Transcription error:", error);
        return NextResponse.json(
            {error: "Transcription failed."},
            {status: 500}
        );
    }
}
