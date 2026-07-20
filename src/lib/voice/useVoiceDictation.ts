"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseVoiceDictationOptions {
  onTranscript: (text: string) => void;
}

export interface UseVoiceDictationResult {
  supported: boolean;
  listening: boolean;
  start: () => void;
  stop: () => void;
  error: string | null;
}

// Errors that just mean "nothing was said" — not worth surfacing to the user.
const SILENT_ERRORS = new Set(["no-speech"]);

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useVoiceDictation({
  onTranscript,
}: UseVoiceDictationOptions): UseVoiceDictationResult {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported] = useState(() => getSpeechRecognitionCtor() !== null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    setError(null);
    const recognition = new Ctor();
    recognition.lang = "uk-UA";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          onTranscript(result[0].transcript.trim());
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (!SILENT_ERRORS.has(event.error)) {
        setError(event.error);
      }
      setListening(false);
    };

    // Fires on explicit stop() AND when the browser silently ends recognition on
    // its own (common on iOS even with continuous:true) — both cases must drop
    // us back to idle, or the mic button gets stuck showing "Слухаю…".
    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [onTranscript]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return { supported, listening, start, stop, error };
}
