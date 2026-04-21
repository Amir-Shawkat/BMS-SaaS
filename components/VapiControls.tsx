'use client';

import Transcript from "@/components/Transcript";
import useVapi from "@/hooks/useVapi";
import { IBook } from "@/types";
import { Mic, MicOff } from "lucide-react";
import Image from "next/image";


const VapiControls = ({ book }: {book: IBook}) => {

    const { status, isActive, messages, currentMessages, currentMessage, currentUserMessage, start, stop } = useVapi(book);
    const isAiResponding = status === 'thinking' || status === 'speaking';

    return (

        <div className="mx-auto flex max-w-4xl flex-col gap-6">
                <section className="vapi-header-card">
                    <div className="relative shrink-0">
                        <Image
                            src={book.coverURL}
                            alt={book.title}
                            width={120}
                            height={180}
                            className="h-auto w-[120px] rounded-lg object-cover shadow-lg"
                        />

                        <div className="vapi-mic-wrapper">
                            {isAiResponding ? <span className="vapi-pulse-ring" aria-hidden="true" /> : null}

                            <button
                                onClick={isActive ? stop : start}
                                disabled={status === 'connecting'}
                                type="button"
                                className={`vapi-mic-btn shadow-md !w-[60px] !h-[60px] ${
                                    isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'
                                }`}
                                aria-label={isActive ? "Stop conversation" : "Start conversation"}
                            >
                                {isActive ? (
                                    <Mic className="size-7 text-white" />
                                ) : (
                                    <MicOff className="size-7 text-[#212a3b]" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
                        <div className="space-y-1">
                            <h1 className="font-serif text-2xl font-bold text-[#212a3b] sm:text-3xl">
                                {book.title}
                            </h1>
                            <p className="text-base text-[#4f5a6d] sm:text-lg">by {book.author}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-dot vapi-status-dot-ready" />
                                <span className="vapi-status-text">Ready</span>
                            </div>

                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">Voice: {book.persona || "Danial"}</span>
                            </div>

                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">0:00/15:00</span>
                            </div>
                        </div>
                    </div>
                </section>



        <div className="vapi-transcript-wrapper">
            <Transcript
                messages={messages}
                currentMessages={currentMessages}
                currentMessage={currentMessage}
                currentUserMessage={currentUserMessage}
            />
        </div>
        </div>
    )
}

export default VapiControls;
