'use client';

import { Messages } from "@/types";
import { Mic } from "lucide-react";
import { useEffect, useRef } from "react";

type TranscriptProps = {
    messages: Messages[];
    currentMessages: Messages[];
    currentMessage: string;
    currentUserMessage: string;
};

const Transcript = ({
    messages,
    currentMessages,
    currentMessage,
    currentUserMessage,
}: TranscriptProps) => {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, currentMessage, currentUserMessage]);

    const isEmpty =
        currentMessages.length > 0 ||
        Boolean(currentMessage) ||
        Boolean(currentUserMessage);

    if (!isEmpty) {
        return (
            <div className="transcript-container">
                <div className="transcript-empty">
                    <Mic className="mb-4 size-12 text-[#212a3b]" aria-hidden="true" />
                    <p className="transcript-empty-text">No conversation yet</p>
                    <p className="transcript-empty-hint">
                        Click the mic button above to start talking
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="transcript-container">
            <div className="transcript-messages">
                {currentMessages.map((message, index) => {
                    const isUser = message.role === "user";

                    return (
                        <div
                            key={`${message.role}-${index}-${message.content}`}
                            className={`transcript-message ${
                                isUser
                                    ? "transcript-message-user"
                                    : "transcript-message-assistant"
                            }`}
                        >
                            <div
                                className={`transcript-bubble ${
                                    isUser
                                        ? "transcript-bubble-user"
                                        : "transcript-bubble-assistant"
                                }`}
                            >
                                {message.content}
                            </div>
                        </div>
                    );
                })}

                <div ref={bottomRef} aria-hidden="true" />
            </div>
        </div>
    );
};

export default Transcript;
