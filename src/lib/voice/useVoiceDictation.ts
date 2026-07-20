"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export interface UseVoiceDictationOptions {
  onTranscript: (text: string) => void;
}

export interface UseVoiceDictationResult {
  supported: boolean;
  listening: boolean;
  interimText: string;
  start: () => void;
  stop: () => void;
  error: string | null;
}

// Errors that just mean "nothing was said" — not worth surfacing to the user.
const SILENT_ERRORS = new Set(["no-speech"]);

// "aborted" fires spuriously on some browsers/devices mid-session even though
// the user never asked to stop — worth a few silent retries before we bother
// them with an error banner.
const MAX_ABORT_RETRIES = 3;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

// Browser support never changes after load, so subscribe is a no-op — this
// only exists to give the server a stable snapshot (false) that differs from
// the client's real one without React flagging a hydration mismatch.
function subscribeToSupport() {
  return () => {};
}
function getSupportSnapshot(): boolean {
  return getSpeechRecognitionCtor() !== null;
}
function getServerSupportSnapshot(): boolean {
  return false;
}

export function useVoiceDictation({
  onTranscript,
}: UseVoiceDictationOptions): UseVoiceDictationResult {
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const supported = useSyncExternalStore(
    subscribeToSupport,
    getSupportSnapshot,
    getServerSupportSnapshot
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const abortRetriesRef = useRef(0);
  const retryPendingRef = useRef(false);
  const manualStopRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const beginSessionRef = useRef<() => void>(() => {});

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  // Creates and starts one recognition attempt. Called for the initial
  // start() and, silently, for each aborted-retry — the caller decides
  // whether `listening`/retry counters get reset.
  const beginSession = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "uk-UA";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      abortRetriesRef.current = 0; // a working result means the connection is healthy
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          setInterimText("");
          onTranscriptRef.current(transcript.trim());
        } else {
          setInterimText(transcript);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // A manual stop() can itself trigger an "aborted" error on some
      // browsers — that's the user's own request, not a failure, so it must
      // never trigger a retry or a banner. onend (below) finishes it cleanly.
      if (manualStopRef.current) return;

      if (event.error === "aborted" && abortRetriesRef.current < MAX_ABORT_RETRIES) {
        abortRetriesRef.current += 1;
        retryPendingRef.current = true;
        return; // stay silent — onend (below) does the actual restart
      }

      retryPendingRef.current = false;
      if (!SILENT_ERRORS.has(event.error)) {
        setError(event.error);
      }
    };

    // Fires after onerror, and also when the browser silently ends
    // recognition on its own (common on iOS even with continuous:true).
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return; // superseded already

      if (retryPendingRef.current && !manualStopRef.current) {
        retryPendingRef.current = false;
        beginSessionRef.current(); // silent retry — `listening` stays true throughout
        return;
      }

      retryPendingRef.current = false;
      manualStopRef.current = false;
      setInterimText("");
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  useEffect(() => {
    beginSessionRef.current = beginSession;
  }, [beginSession]);

  const start = useCallback(() => {
    if (!getSpeechRecognitionCtor()) return;
    setError(null);
    setInterimText("");
    abortRetriesRef.current = 0;
    retryPendingRef.current = false;
    manualStopRef.current = false;
    beginSession();
    setListening(true);
  }, [beginSession]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return { supported, listening, interimText, start, stop, error };
}
