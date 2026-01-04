import React, { useEffect, useState, useRef } from "react";
import { Mic, MicOff, Brain, Volume2, X } from "lucide-react";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface GeminiLiveCoachProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeminiLiveCoach: React.FC<GeminiLiveCoachProps> = ({
  isOpen,
  onClose,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("Initializing Neural Link...");

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(false);

  // Gemini Session
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  // Audio Playback Queue
  const nextStartTime = useRef<number>(0);
  const outputSources = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    mountedRef.current = true;
    if (isOpen) {
      connectLive();
    } else {
      disconnectLive();
    }
    return () => {
      mountedRef.current = false;
      disconnectLive();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const connectLive = async () => {
    if (!process.env.API_KEY) {
      if (mountedRef.current) setStatus("Error: No API Key");
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Setup Audio Context
      audioContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 16000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (mountedRef.current) setStatus("Connecting to Spirit Realm...");

      // Connect to Gemini
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            if (!mountedRef.current) return;
            setIsConnected(true);
            setStatus("Coach Online. Speaking...");

            // Start Input Stream
            if (!audioContextRef.current || !streamRef.current) return;

            inputSourceRef.current =
              audioContextRef.current.createMediaStreamSource(
                streamRef.current,
              );
            processorRef.current =
              audioContextRef.current.createScriptProcessor(4096, 1, 1);

            processorRef.current.onaudioprocess = (e) => {
              if (isMuted || !mountedRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            inputSourceRef.current.connect(processorRef.current);
            processorRef.current.connect(audioContextRef.current.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (!mountedRef.current) return;
            const audioData =
              msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              playAudioChunk(audioData);
            }
            if (msg.serverContent?.turnComplete) {
              setStatus("Listening...");
            }
          },
          onclose: () => {
            if (mountedRef.current) {
              setIsConnected(false);
              setStatus("Connection Closed");
            }
          },
          onerror: (e) => {
            console.error(e);
            if (mountedRef.current) setStatus("Neural Link Severed");
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction:
            "You are a hardcore strength coach. Brief, intense, motivational commands only. If the user complains, tell them to embrace the pain.",
        },
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (e) {
      console.error(e);
      if (mountedRef.current) setStatus("Connection Failed");
    }
  };

  const disconnectLive = () => {
    // 1. Close Gemini Session
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then((session) => {
        try {
          session.close();
        } catch (e) {
          console.warn("Session close error", e);
        }
      });
      sessionPromiseRef.current = null;
    }

    // 2. Stop Audio Tracks (Mic)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // 3. Close Audio Context & Nodes
    if (audioContextRef.current) {
      const ctx = audioContextRef.current;

      if (inputSourceRef.current) {
        try {
          inputSourceRef.current.disconnect();
        } catch (e) {}
        inputSourceRef.current = null;
      }
      if (processorRef.current) {
        try {
          processorRef.current.disconnect();
          processorRef.current.onaudioprocess = null;
        } catch (e) {}
        processorRef.current = null;
      }

      if (ctx.state !== "closed") {
        ctx.close().catch(console.error);
      }
      audioContextRef.current = null;
    }

    // 4. Clear Queued Audio
    outputSources.current.forEach((s) => {
      try {
        s.stop();
      } catch (e) {}
    });
    outputSources.current.clear();

    if (mountedRef.current) {
      setIsConnected(false);
      setStatus("Neural Link Terminated");
    }
  };

  // Helper: Float32 to PCM Blob
  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    let binary = "";
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return {
      data: btoa(binary),
      mimeType: "audio/pcm;rate=16000",
    };
  };

  // Helper: Decode and Play
  const playAudioChunk = async (base64: string) => {
    if (!audioContextRef.current || audioContextRef.current.state === "closed")
      return;

    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const dataInt16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(dataInt16.length);
      for (let i = 0; i < dataInt16.length; i++) {
        float32[i] = dataInt16[i] / 32768.0;
      }

      const buffer = audioContextRef.current.createBuffer(
        1,
        float32.length,
        24000,
      );
      buffer.copyToChannel(float32, 0);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);

      const now = audioContextRef.current.currentTime;
      const start = Math.max(now, nextStartTime.current);
      source.start(start);
      nextStartTime.current = start + buffer.duration;

      outputSources.current.add(source);
      source.onended = () => outputSources.current.delete(source);
    } catch (e) {
      console.error("Audio Decode Error", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 animate-slide-up">
      <div className="bg-black/90 border border-purple-500 rounded-lg p-4 shadow-[0_0_20px_rgba(168,85,247,0.3)] w-72 backdrop-blur-md">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 text-purple-400">
            <Brain className="w-5 h-5 animate-pulse" />
            <span className="font-bold uppercase text-xs tracking-widest">
              Gemini Coach
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-24 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center relative overflow-hidden">
          {/* Visualizer (Fake) */}
          <div className="flex gap-1 items-end h-10">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`w-2 bg-purple-500 rounded-t ${isConnected ? "animate-bounce" : "h-1"}`}
                style={{ animationDelay: `${i * 0.1}s`, height: "50%" }}
              ></div>
            ))}
          </div>
          <div className="absolute top-2 left-2 text-[9px] text-zinc-500 font-mono">
            STATUS: {status}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex-1 py-3 rounded border font-bold uppercase text-xs flex items-center justify-center gap-2 ${isMuted ? "bg-red-900/50 border-red-500 text-red-400" : "bg-purple-900/50 border-purple-500 text-white"}`}
          >
            {isMuted ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            {isMuted ? "Muted" : "Live"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiLiveCoach;
