import { useState, useEffect, useCallback, useRef } from "react";

interface VoiceCommandResult {
  isListening: boolean;
  transcript: string;
  toggleListening: () => void;
  lastCommand: string | null;
}

export const useVoiceCommand = (
  onCommand: (type: string, value: number | string) => void,
): VoiceCommandResult => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript
            .toLowerCase()
            .trim();
          setTranscript(transcriptText);
          processCommand(transcriptText);
        };

        // Handle permission denial or other fatal errors
        recognition.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          if (
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
          ) {
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          // Only auto-restart if we are still supposed to be listening
          if (isListening) {
            try {
              recognition.start();
            } catch (e) {
              // If restart fails (e.g. permanent permission denial), stop the state
              console.error("Failed to restart recognition", e);
              setIsListening(false);
            }
          }
        };

        recognitionRef.current = recognition;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const processCommand = (text: string) => {
    // Number Parser Helper
    const parseNumber = (str: string): number | null => {
      const wordsToNumbers: Record<string, number> = {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
      };

      const match = str.match(/\d+/);
      if (match) return parseInt(match[0]);

      for (const [word, num] of Object.entries(wordsToNumbers)) {
        if (str.includes(word)) return num;
      }
      return null;
    };

    // 1. Reps Command ("5 reps", "10 reps")
    if (text.includes("rep")) {
      const num = parseNumber(text);
      if (num !== null) {
        setLastCommand(`Reps: ${num}`);
        onCommand("REPS", num);
        return;
      }
    }

    // 2. RPE Command ("RPE 8", "RPE 9")
    if (text.includes("rpe") || text.includes("rate")) {
      const num = parseNumber(text);
      if (num !== null) {
        setLastCommand(`RPE: ${num}`);
        onCommand("RPE", num);
        return;
      }
    }

    // 3. Completion Command ("Complete", "Done", "Finish", "Next")
    if (
      text.includes("complete") ||
      text.includes("done") ||
      text.includes("finish") ||
      text.includes("next")
    ) {
      setLastCommand("Complete Set");
      onCommand("COMPLETE", 0);
      return;
    }
  };

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Mic Start Error", e);
        setIsListening(false);
      }
    }
  }, [isListening]);

  return { isListening, transcript, toggleListening, lastCommand };
};
