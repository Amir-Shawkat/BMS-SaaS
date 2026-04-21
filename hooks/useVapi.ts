import { endVoiceSession, startVoiceSession } from "@/lib/actions/session.actions";
import { ASSISTANT_ID, DEFAULT_VOICE } from "@/lib/constants";
import { IBook, Messages } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

export type CallStatus =
  | "idle"
  | "connecting"
  | "starting"
  | "listening"
  | "thinking"
  | "speaking";

type TranscriptMessageEvent = {
  type: "transcript" | "transcript[transcriptType='final']";
  role: "assistant" | "user";
  transcriptType: "partial" | "final";
  transcript: string;
};

const useLatestRef = <T,>(value: T) => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;

let vapi: InstanceType<typeof Vapi>;

const isTranscriptMessageEvent = (
  message: unknown
): message is TranscriptMessageEvent => {
  if (!message || typeof message !== "object") return false;

  const event = message as Partial<TranscriptMessageEvent>;

  return (
    (event.type === "transcript" ||
      event.type === "transcript[transcriptType='final']") &&
    (event.role === "assistant" || event.role === "user") &&
    (event.transcriptType === "partial" || event.transcriptType === "final") &&
    typeof event.transcript === "string"
  );
};

function getVapi() {
  if (!vapi) {
    if (!VAPI_API_KEY) {
      throw new Error(
        "NEXT_PUBLIC_VAPI_API_KEY not found. Please set it in the .env file."
      );
    }

    vapi = new Vapi(VAPI_API_KEY);
  }

  return vapi;
}

const appendMessageIfNew = (
  existingMessages: Messages[],
  nextMessage: Messages
) => {
  const lastMessage = existingMessages[existingMessages.length - 1];

  if (
    lastMessage?.role === nextMessage.role &&
    lastMessage?.content.trim() === nextMessage.content.trim()
  ) {
    return existingMessages;
  }

  return [...existingMessages, nextMessage];
};

export const useVapi = (book: IBook) => {
  const { userId } = useAuth();

  const [status, setStatus] = useState<CallStatus>("idle");
  const [messages, setMessages] = useState<Messages[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentUserMessage, setCurrentUserMessage] = useState("");
  const [duration, setDuration] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const durationRef = useLatestRef(duration);
  const voice = book.persona || DEFAULT_VOICE;

  const isActive =
    status === "listening" ||
    status === "thinking" ||
    status === "speaking" ||
    status === "starting";

  const currentMessages = [
    ...messages,
    ...(currentUserMessage
      ? [{ role: "user", content: currentUserMessage } satisfies Messages]
      : []),
    ...(currentMessage
      ? [{ role: "assistant", content: currentMessage } satisfies Messages]
      : []),
  ];

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const finalizeSession = useCallback(async () => {
    clearTimer();

    const sessionId = sessionIdRef.current;
    sessionIdRef.current = null;

    if (!sessionId) return;

    const result = await endVoiceSession(sessionId, durationRef.current);

    if (!result.success) {
      console.error("Error ending call session", result.error);
    }
  }, [durationRef]);

  useEffect(() => {
    const client = getVapi();

    const handleCallStart = () => {
      setStatus("listening");
      setDuration(0);
      clearTimer();

      timerRef.current = setInterval(() => {
        setDuration((previous) => previous + 1);
      }, 1000);
    };

    const handleSpeechStart = () => {
      setStatus("speaking");
    };

    const handleSpeechEnd = () => {
      setStatus("listening");
    };

    const handleMessage = (message: unknown) => {
      if (!isTranscriptMessageEvent(message)) return;

      const transcript = message.transcript.trim();

      if (!transcript) return;

      if (message.role === "user") {
        if (message.transcriptType === "partial") {
          setCurrentUserMessage(transcript);
          return;
        }

        setCurrentUserMessage("");
        setCurrentMessage("");
        setStatus("thinking");
        setMessages((previous) =>
          appendMessageIfNew(previous, { role: "user", content: transcript })
        );
        return;
      }

      if (message.transcriptType === "partial") {
        setCurrentMessage(transcript);
        setStatus("speaking");
        return;
      }

      setCurrentMessage("");
      setStatus("listening");
      setMessages((previous) =>
        appendMessageIfNew(previous, { role: "assistant", content: transcript })
      );
    };

    const handleCallEnd = () => {
      clearTimer();
      setCurrentMessage("");
      setCurrentUserMessage("");
      setStatus("idle");
      void finalizeSession();
    };

    const handleError = (error: unknown) => {
      console.error("Vapi error", error);
      setStatus("idle");
      setCurrentMessage("");
      setCurrentUserMessage("");
      clearTimer();
      void finalizeSession();
    };

    client.on("call-start", handleCallStart);
    client.on("speech-start", handleSpeechStart);
    client.on("speech-end", handleSpeechEnd);
    client.on("message", handleMessage);
    client.on("call-end", handleCallEnd);
    client.on("error", handleError);

    return () => {
      client.removeListener("call-start", handleCallStart);
      client.removeListener("speech-start", handleSpeechStart);
      client.removeListener("speech-end", handleSpeechEnd);
      client.removeListener("message", handleMessage);
      client.removeListener("call-end", handleCallEnd);
      client.removeListener("error", handleError);
      clearTimer();
    };
  }, [finalizeSession]);

  const start = async () => {
    if (!userId) {
      return setLimitError("Please login to start a conversation");
    }

    setLimitError(null);
    setStatus("connecting");

    try {
      const result = await startVoiceSession(userId, book._id);

      if (!result.success) {
        setLimitError(result.error || "Session limit reached. Please upgrade your plan.");
        setStatus("idle");
        return;
      }

      sessionIdRef.current = result.sessionId || null;
      setMessages([]);
      setCurrentMessage("");
      setCurrentUserMessage("");
      setDuration(0);

      const firstMessage = `Hey, good to meet you. Quick question, before we dive in : have you actually read
            ${book.title} yet? Or are we starting fresh?`;

      setStatus("starting");

      await getVapi().start(ASSISTANT_ID, {
        firstMessage,
        variableValues: {
          title: book.title,
          author: book.author,
          bookId: book._id,
          voice,
        },
      });
    } catch (error) {
      console.error("Error starting call", error);
      setStatus("idle");
      setLimitError("An error occured while starting the call");
    }
  };

  const stop = async () => {
    await getVapi().stop();
  };

  const clearErrors = async () => {
    setLimitError(null);
  };

  return {
    status,
    isActive,
    messages,
    currentMessages,
    currentMessage,
    currentUserMessage,
    duration,
    limitError,
    start,
    stop,
    clearErrors,
  };
};

export default useVapi;
