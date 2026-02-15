'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Loader2, Sparkles } from 'lucide-react';
import { addFactoryTask } from '@/actions/factory';
import { useRouter } from 'next/navigation';

import { VoiceCommandPresenter } from './VoiceCommandPresenter';

export function VoiceCommandControl() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const router = useRouter();

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'sv-SE';

            recognitionRef.current.onresult = (event: any) => {
                const currentTranscript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result) => result.transcript)
                    .join('');
                setTranscript(currentTranscript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setError(`Mikrofonfel: ${event.error}`);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } else {
            setError('Web Speech API stöds inte i denna webbläsare.');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscript('');
            setError(null);
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleSubmit = async () => {
        if (!transcript.trim() || isProcessing) return;

        setIsProcessing(true);
        try {
            const result = await addFactoryTask(transcript, 'WEB_UI', {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });

            if (result.success) {
                setTranscript('');
                router.refresh();
            } else {
                setError('Kunde inte spara uppgiften.');
            }
        } catch (err) {
            setError('Ett fel uppstod vid kommunikation med servern.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <VoiceCommandPresenter
            isListening={isListening}
            transcript={transcript}
            isProcessing={isProcessing}
            error={error}
            onToggleListening={toggleListening}
            onSubmit={handleSubmit}
        />
    );
}
