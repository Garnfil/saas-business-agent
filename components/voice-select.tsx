import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const voices = [
  { id: "alloy", label: "Bold Alloy" },
  { id: "ash", label: "Silent Ash" },
  { id: "ballad", label: "Melodic Ballad" },
  { id: "coral", label: "Calm Coral" },
  { id: "echo", label: "Gentle Echo" },
  { id: "fable", label: "Wise Fable" },
  { id: "nova", label: "Lovely Nova" },
  { id: "onyx", label: "Deep Onyx" },
  { id: "sage", label: "Thoughtful Sage" },
  { id: "shimmer", label: "Sparkling Shimmer" },
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
    <Select value={selectedVoice} onValueChange={handleVoiceChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select a voice" />
      </SelectTrigger>
      <SelectContent>
        {voices.map((voice) => (
          <SelectItem key={voice.id} value={voice.id}>
            {voice.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
