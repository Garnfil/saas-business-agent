import {useState} from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const voices = [
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
];

interface VoiceSelectProps {
    onVoiceChange: (voice: string) => void;
    defaultVoice?: string;
}

export function VoiceSelect({
    onVoiceChange,
    defaultVoice = "shimmer",
}: VoiceSelectProps) {
    const [selectedVoice, setSelectedVoice] = useState(defaultVoice);

    const handleVoiceChange = (voice: string) => {
        setSelectedVoice(voice);
        onVoiceChange(voice);
    };

    return (
        <Select
            value={selectedVoice}
            onValueChange={handleVoiceChange}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
                {voices.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                        {voice.charAt(0).toUpperCase() +
                            voice.slice(1)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
