"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type VoiceCommand = {
  pattern: RegExp;
  action: string;
  extract: (match: RegExpMatchArray) => Record<string, number | string>;
};

interface VoiceCommandResult {
  action: string;
  params: Record<string, number | string>;
  transcript: string;
  confidence: number;
}

const VOICE_COMMANDS: VoiceCommand[] = [
  // "log 100 kg for 5 reps" or "100 kilos 5 reps"
  {
    pattern:
      /(\d+)\s*(kg|kilos?|pounds?|lbs?)?\s*(for|x|times)?\s*(\d+)\s*(reps?)?/i,
    action: "LOG_SET",
    extract: (m) => ({ weight: parseInt(m[1]), reps: parseInt(m[4]) }),
  },
  // "5 reps at 100 kg"
  {
    pattern: /(\d+)\s*reps?\s*(at|with)?\s*(\d+)\s*(kg|kilos?)?/i,
    action: "LOG_SET",
    extract: (m) => ({ reps: parseInt(m[1]), weight: parseInt(m[3]) }),
  },
  // "rest" or "start rest"
  {
    pattern: /^(start\s*)?rest$/i,
    action: "START_REST",
    extract: () => ({}),
  },
  // "rest 90" or "rest 2 minutes"
  {
    pattern: /rest\s*(\d+)\s*(seconds?|secs?|minutes?|mins?)?/i,
    action: "START_REST",
    extract: (m) => {
      const value = parseInt(m[1]);
      const isMinutes = m[2]?.startsWith("min");
      return { seconds: isMinutes ? value * 60 : value };
    },
  },
  // "next exercise"
  {
    pattern: /^next\s*(exercise|set)?$/i,
    action: "NEXT_EXERCISE",
    extract: () => ({}),
  },
  // "finish" or "complete workout"
  {
    pattern: /^(finish|complete|end)\s*(workout)?$/i,
    action: "FINISH_WORKOUT",
    extract: () => ({}),
  },
];

/**
 * Check if speech recognition is available.
 */
export function isSpeechRecognitionAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
}

/**
 * Hook for voice commands.
 */
export function useVoiceCommands(
  onCommand?: (result: VoiceCommandResult) => void,
) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any | null>(null);

  const parseCommand = useCallback(
    (text: string, confidence: number): VoiceCommandResult | null => {
      for (const cmd of VOICE_COMMANDS) {
        const match = text.match(cmd.pattern);
        if (match) {
          return {
            action: cmd.action,
            params: cmd.extract(match),
            transcript: text,
            confidence,
          };
        }
      }
      return null;
    },
    [],
  );

  useEffect(() => {
    if (!isSpeechRecognitionAvailable()) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript;
      setTranscript(text);

      if (last.isFinal) {
        const result = parseCommand(text, last[0].confidence);
        if (result && onCommand) {
          onCommand(result);
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognitionRef.current?.abort();
    };
  }, [onCommand, parseCommand]);


  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript("");
    recognitionRef.current.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return {
    isAvailable: isSpeechRecognitionAvailable(),
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
  };
}

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
